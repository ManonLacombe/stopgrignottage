package com.manon.stopgrignottage;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Garde les liens de l'app à l'intérieur, envoie le reste au navigateur,
 * et affiche une page de secours si la première visite se fait hors ligne.
 *
 * Classe nommée plutôt qu'anonyme : la version de d8 livrée avec le SDK 34
 * plante sur les classes anonymes.
 */
class AppWebViewClient extends WebViewClient {

    private static final String START_URL = "https://manonlacombe.github.io/stopgrignottage/";

    private final Context context;

    AppWebViewClient(Context context) {
        this.context = context;
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        String host = url.getHost() == null ? "" : url.getHost();
        if (host.equals("manonlacombe.github.io")) {
            return false;
        }
        context.startActivity(new Intent(Intent.ACTION_VIEW, url));
        return true;
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        if (request.isForMainFrame()) {
            showOffline(view);
        }
    }

    private void showOffline(WebView view) {
        String html = "<!doctype html><html lang='fr'><head><meta charset='utf-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1'>"
                + "<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;"
                + "align-items:center;justify-content:center;background:#FBF8F3;color:#2F2A24;"
                + "font-family:system-ui,-apple-system,sans-serif;padding:32px;text-align:center}"
                + "h1{font-size:22px;margin:0 0 12px}p{color:#6B6459;line-height:1.5;"
                + "max-width:34ch;margin:0 0 28px}a{display:inline-block;background:#3F6B52;"
                + "color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:600}</style>"
                + "</head><body><h1>Pas de connexion</h1>"
                + "<p>StopGrignottage a besoin d’une connexion la première fois, pour s’installer. "
                + "Ensuite, l’app fonctionne hors ligne.</p>"
                + "<a href='" + START_URL + "'>Réessayer</a></body></html>";
        view.loadDataWithBaseURL(START_URL, html, "text/html", "utf-8", null);
    }
}
