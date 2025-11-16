from django.shortcuts import render
from .serializers import UserSerializer
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ProtectedView(APIView):
    """ IsAuthenticated feature is used for to access any page after authentication like after login """
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        response = {
            'Status' : 'Request was permited'
        }
        return  Response(response)