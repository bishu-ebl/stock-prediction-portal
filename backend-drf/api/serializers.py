# Create serializer to accept Ticker from the frotend
# We will create custom serializer here instead of model serial beause we do not create any model for Ticker

from rest_framework import serializers

class StockPredictionSerializer(serializers.Serializer):
    ticker = serializers.CharField(max_length = 20)