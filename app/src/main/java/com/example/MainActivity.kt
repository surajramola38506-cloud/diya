package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  private var webView: WebView? = null
  private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      MyApplicationTheme {
        val context = LocalContext.current
        var webViewInstance by remember { mutableStateOf<WebView?>(null) }

        // Activity Result Launcher for selecting photos to upload into the Gallery
        val filePickerLauncher =
          rememberLauncherForActivityResult(
            contract = ActivityResultContracts.StartActivityForResult()
          ) { result ->
            val uris: Array<Uri>? =
              if (result.resultCode == RESULT_OK && result.data != null) {
                val data = result.data
                val clipData = data?.clipData
                if (clipData != null) {
                  Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                } else if (data?.data != null) {
                  arrayOf(data.data!!)
                } else {
                  null
                }
              } else {
                null
              }
            fileUploadCallback?.onReceiveValue(uris)
            fileUploadCallback = null
          }

        BackHandler(enabled = webViewInstance?.canGoBack() == true) {
          webViewInstance?.goBack()
        }

        Scaffold(
          modifier = Modifier.fillMaxSize(),
          contentWindowInsets = WindowInsets(0, 0, 0, 0),
        ) { paddingValues ->
          Box(
            modifier =
              Modifier.fillMaxSize()
                .padding(paddingValues)
                .background(MaterialTheme.colorScheme.background)
          ) {
            // Fullscreen Hardware Accelerated WebView
            BirthdayWebView(
              modifier = Modifier.fillMaxSize().testTag("birthday_web_view"),
              onWebViewCreated = { wv ->
                webView = wv
                webViewInstance = wv
              },
              onShowFileChooser = { callback ->
                fileUploadCallback = callback
                val intent =
                  Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "image/*"
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false)
                  }
                filePickerLauncher.launch(Intent.createChooser(intent, "Choose Birthday Photo"))
              },
            )

            // Discreet Native Quick Share FAB at top end
            FloatingActionButton(
              onClick = {
                shareExperience(
                  context,
                  "👑 Experience Diya's Ultra-Premium Cinematic Birthday Celebration! 3D Cake, Soft Piano & Love ✨",
                )
              },
              modifier =
                Modifier.align(Alignment.TopEnd)
                  .windowInsetsPadding(WindowInsets.statusBars)
                  .padding(top = 12.dp, end = 12.dp)
                  .testTag("native_share_button"),
              containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.9f),
              contentColor = Color.Black,
            ) {
              Icon(imageVector = Icons.Default.Share, contentDescription = "Share Celebration")
            }
          }
        }
      }
    }
  }

  private fun shareExperience(context: Context, text: String) {
    val intent =
      Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, "Royal Birthday Celebration ✨")
        putExtra(Intent.EXTRA_TEXT, text)
      }
    context.startActivity(Intent.createChooser(intent, "Share Birthday Celebration"))
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun BirthdayWebView(
  modifier: Modifier = Modifier,
  onWebViewCreated: (WebView) -> Unit,
  onShowFileChooser: (ValueCallback<Array<Uri>>) -> Unit,
) {
  val context = LocalContext.current

  AndroidView(
    modifier = modifier,
    factory = { ctx ->
      WebView(ctx).apply {
        setLayerType(View.LAYER_TYPE_HARDWARE, null)
        setBackgroundColor(android.graphics.Color.parseColor("#0A040E"))

        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          mediaPlaybackRequiresUserGesture = false
          useWideViewPort = true
          loadWithOverviewMode = true
          cacheMode = WebSettings.LOAD_DEFAULT
          builtInZoomControls = false
          displayZoomControls = false
        }

        // Bridge for native Android vibration, sharing, and toasts
        addJavascriptInterface(AndroidWebBridge(ctx), "AndroidBridge")

        webChromeClient =
          object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
              // Grant audio record for microphone candle blowing puff detection
              request?.grant(request.resources)
            }

            override fun onShowFileChooser(
              webView: WebView?,
              filePathCallback: ValueCallback<Array<Uri>>?,
              fileChooserParams: FileChooserParams?,
            ): Boolean {
              if (filePathCallback != null) {
                onShowFileChooser(filePathCallback)
                return true
              }
              return false
            }
          }

        webViewClient =
          object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
              super.onPageFinished(view, url)
            }
          }

        loadUrl("file:///android_asset/birthday/index.html")
        onWebViewCreated(this)
      }
    },
  )
}

class AndroidWebBridge(private val context: Context) {

  @JavascriptInterface
  fun vibrate(milliseconds: Long) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager =
          context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator?.vibrate(
          VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE)
        )
      } else {
        @Suppress("DEPRECATION")
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        @Suppress("DEPRECATION")
        vibrator?.vibrate(milliseconds)
      }
    } catch (_: Exception) {}
  }

  @JavascriptInterface
  fun shareBirthdayCard(message: String) {
    try {
      val intent =
        Intent(Intent.ACTION_SEND).apply {
          type = "text/plain"
          putExtra(Intent.EXTRA_SUBJECT, "Royal Birthday Celebration ✨")
          putExtra(Intent.EXTRA_TEXT, message)
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
      context.startActivity(Intent.createChooser(intent, "Share Birthday Celebration"))
    } catch (_: Exception) {}
  }

  @JavascriptInterface
  fun showToast(message: String) {
    try {
      Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    } catch (_: Exception) {}
  }
}
