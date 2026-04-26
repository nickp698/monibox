import Foundation
import Capacitor

/**
 * MoniboxIAPPlugin
 *
 * Capacitor plugin that exposes In-App Purchase functionality
 * to the Monibox web app via JavaScript.
 *
 * Usage from web app:
 *   const { MoniboxIAP } = Capacitor.Plugins;
 *   await MoniboxIAP.purchase({ productId: 'ai.monibox.app.pro.monthly' });
 *   await MoniboxIAP.restore();
 *   const { products } = await MoniboxIAP.getProducts();
 */

@objc(MoniboxIAPPlugin)
public class MoniboxIAPPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "MoniboxIAPPlugin"
    public let jsName = "MoniboxIAP"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
    ]

    override public func load() {
        // Initialize IAP manager with the web view
        if let webView = bridge?.webView {
            MoniboxIAPManager.shared.setup(webView: webView)
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Missing productId")
            return
        }

        MoniboxIAPManager.shared.purchase(productId: productId) { success, error in
            if success {
                call.resolve(["success": true])
            } else {
                call.reject(error ?? "Purchase failed")
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        MoniboxIAPManager.shared.restorePurchases { success, error in
            if success {
                call.resolve(["success": true])
            } else {
                call.reject(error ?? "Restore failed")
            }
        }
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        // Products are fetched on load — return current state
        call.resolve(["available": true])
    }
}
