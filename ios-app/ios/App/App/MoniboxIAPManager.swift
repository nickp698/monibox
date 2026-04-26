import Foundation
import StoreKit
import Capacitor
import WebKit

/**
 * MoniboxIAPManager
 *
 * Handles Apple In-App Purchase for Monibox Pro subscription.
 * Communicates purchase status to the web app via JavaScript bridge.
 *
 * Product IDs (configure in App Store Connect):
 *   - ai.monibox.app.pro.monthly   — Monibox Pro Monthly ($4.99/mo)
 *   - ai.monibox.app.pro.annual     — Monibox Pro Annual ($39.99/yr)
 */

class MoniboxIAPManager: NSObject, SKProductsRequestDelegate, SKPaymentTransactionObserver {

    static let shared = MoniboxIAPManager()

    // Product IDs — must match App Store Connect
    static let monthlyProductId = "ai.monibox.app.pro.monthly"
    static let annualProductId = "ai.monibox.app.pro.annual"

    private var products: [SKProduct] = []
    private var webView: WKWebView?
    private var purchaseCompletion: ((Bool, String?) -> Void)?

    private override init() {
        super.init()
    }

    // MARK: - Setup

    func setup(webView: WKWebView) {
        self.webView = webView
        SKPaymentQueue.default().add(self)
        fetchProducts()
    }

    // MARK: - Fetch Products

    func fetchProducts() {
        let productIds: Set<String> = [
            MoniboxIAPManager.monthlyProductId,
            MoniboxIAPManager.annualProductId
        ]
        let request = SKProductsRequest(productIdentifiers: productIds)
        request.delegate = self
        request.start()
    }

    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        products = response.products
        print("[MoniboxIAP] Fetched \(products.count) products")

        // Notify web app of available products
        let productData = products.map { product -> [String: Any] in
            return [
                "id": product.productIdentifier,
                "title": product.localizedTitle,
                "description": product.localizedDescription,
                "price": product.price.doubleValue,
                "priceLocale": product.priceLocale.currencySymbol ?? "",
                "formattedPrice": formatPrice(product)
            ]
        }

        if let jsonData = try? JSONSerialization.data(withJSONObject: productData),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            evaluateJS("window.MoniboxNative && (window.MoniboxNative.iap.available = true, window.MoniboxNative.iap.products = \(jsonString))")
        }
    }

    // MARK: - Purchase

    func purchase(productId: String, completion: @escaping (Bool, String?) -> Void) {
        guard let product = products.first(where: { $0.productIdentifier == productId }) else {
            completion(false, "Product not found")
            return
        }

        guard SKPaymentQueue.canMakePayments() else {
            completion(false, "Payments are disabled on this device")
            return
        }

        purchaseCompletion = completion
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }

    // MARK: - Restore Purchases

    func restorePurchases(completion: @escaping (Bool, String?) -> Void) {
        purchaseCompletion = completion
        SKPaymentQueue.default().restoreCompletedTransactions()
    }

    // MARK: - Transaction Observer

    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                handlePurchased(transaction)
            case .restored:
                handleRestored(transaction)
            case .failed:
                handleFailed(transaction)
            case .deferred:
                print("[MoniboxIAP] Transaction deferred")
            case .purchasing:
                print("[MoniboxIAP] Transaction in progress")
            @unknown default:
                break
            }
        }
    }

    private func handlePurchased(_ transaction: SKPaymentTransaction) {
        print("[MoniboxIAP] Purchase successful: \(transaction.payment.productIdentifier)")
        SKPaymentQueue.default().finishTransaction(transaction)

        // Get receipt for server-side validation
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            // Send receipt to web app for Supabase validation
            evaluateJS("""
                window.MoniboxNative && window.dispatchEvent(new CustomEvent('monibox-iap-purchased', {
                    detail: {
                        productId: '\(transaction.payment.productIdentifier)',
                        receipt: '\(receiptString)',
                        transactionId: '\(transaction.transactionIdentifier ?? "")'
                    }
                }))
            """)
        }

        purchaseCompletion?(true, nil)
        purchaseCompletion = nil
    }

    private func handleRestored(_ transaction: SKPaymentTransaction) {
        print("[MoniboxIAP] Purchase restored: \(transaction.payment.productIdentifier)")
        SKPaymentQueue.default().finishTransaction(transaction)

        evaluateJS("""
            window.MoniboxNative && window.dispatchEvent(new CustomEvent('monibox-iap-restored', {
                detail: { productId: '\(transaction.payment.productIdentifier)' }
            }))
        """)

        purchaseCompletion?(true, nil)
        purchaseCompletion = nil
    }

    private func handleFailed(_ transaction: SKPaymentTransaction) {
        let errorMessage = transaction.error?.localizedDescription ?? "Unknown error"
        print("[MoniboxIAP] Purchase failed: \(errorMessage)")
        SKPaymentQueue.default().finishTransaction(transaction)

        evaluateJS("""
            window.MoniboxNative && window.dispatchEvent(new CustomEvent('monibox-iap-failed', {
                detail: { error: '\(errorMessage)' }
            }))
        """)

        purchaseCompletion?(false, errorMessage)
        purchaseCompletion = nil
    }

    // MARK: - Helpers

    private func formatPrice(_ product: SKProduct) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = product.priceLocale
        return formatter.string(from: product.price) ?? "\(product.price)"
    }

    private func evaluateJS(_ js: String) {
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}
