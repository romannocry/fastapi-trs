import json
from typing import List, Optional, Dict, Any
from fastapi. encoders import jsonable_encoder 
from starlette. responses import HTMLResponse

DEFAULT_SWAGGER_JS_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.30.0/swagger-ui-bundle.js"
DEFAULT_SWAGGER_CSS_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.30.0/swagger-ui.css"

def get_swagger_ui_html_patched(
    *,
    openapi_url:str,
    title:str,
    swagger_js_url: List[str]= None,
    swagger_css_url: List[str] = None,
    swagger_favicon_url: str = "https://fastapi.tiangolo.com/img/favicon.png",
    oauth2_redirect_url: Optional[str] = None,
    init_oauth: Optional[dict] = None,
    swagger_ui_parameters: Optional[Dict[str, Any]] = None
) -> HTMLResponse:

    if swagger_js_url is None:
        swagger_js_url = [DEFAULT_SWAGGER_JS_URL]
    if swagger_css_url is None:
        swagger_css_url = [DEFAULT_SWAGGER_CSS_URL]

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>"""

    for css in swagger_css_url:
        html += f'<link type="text/css" rel="stylesheet" href="{css}">'

    html += f"""
    <link rel="shortcut icon" href="{swagger_favicon_url}">
    <title>{title}</title>
    </head>
    <body>
    <div id="swagger-ui">
    </div>"""

    for js in swagger_js_url:
        html += f'<script src="{js}"></script>'

    html += f"""
    <!-- Swagger UIBundle is now available on the page -->
    <script>
    const ui = SwaggerUIBundle({{
        url: '{openapi_url}',
    """

    if oauth2_redirect_url:
        html += f"oauth2RedirectUrl: window.location.origin + '{oauth2_redirect_url}',"
    
    html += """
        dom_id: '#swagger-ui',
        presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true,
        showExtension: true,
        showCommonExtensions: true
    })"""

    if init_oauth:
        html += f"""
        ui.initOAuth({json.dumps(jsonable_encoder(init_oauth))})
        """
    
    html += """
    </script>
    </body>
    </html>
    """
    return HTMLResponse(html)

def swagger_monkey_patch(*args,**kwargs):
    return get_swagger_ui_html_patched(
        *args,**kwargs,
        swagger_js_url=[
            DEFAULT_SWAGGER_JS_URL,
            "/serverjs/swaggerui-issue1974.js"
        ],
    )