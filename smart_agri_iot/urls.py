from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from django.views.static import serve

from api.views import frontend_index

urlpatterns = [
    path("", frontend_index),
    path("api/v1/", include("api.urls")),
    re_path(r"^(?P<path>.*\.html)$", serve, {"document_root": settings.BASE_DIR / "frontend"}),
    re_path(r"^(?P<path>css/.*)$", serve, {"document_root": settings.BASE_DIR / "frontend"}),
    re_path(r"^(?P<path>js/.*)$", serve, {"document_root": settings.BASE_DIR / "frontend"}),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / "frontend")
