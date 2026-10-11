from django.urls import path
from .views import DashboardMetricsView, ExportCirculationCSVView

urlpatterns = [
    path('dashboard/', DashboardMetricsView.as_view(), name='dashboard_metrics'),
    path('export/circulation/', ExportCirculationCSVView.as_view(), name='export_circulation_csv'),
]
