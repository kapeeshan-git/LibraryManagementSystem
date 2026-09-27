from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Reservation
from .serializers import ReservationSerializer, CreateReservationSerializer
from .services import ReservationService

class ReservationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Reservation.objects.select_related('user', 'book', 'allocated_copy')
        if not user.is_admin_or_librarian:
            qs = qs.filter(user=user)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class PlaceReservationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateReservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reservation = ReservationService.create_reservation(
            user=request.user,
            book_id=serializer.validated_data['book_id']
        )
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


class CancelReservationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        reservation = ReservationService.cancel_reservation(
            user=request.user,
            reservation_id=pk
        )
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)
