from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import StockPredictionSerializer
from rest_framework import status
from rest_framework.response import Response
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import os
from django.conf import settings
from .utils import save_plot
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
from sklearn.metrics import mean_squared_error, r2_score

class StockPredictionAPIView(APIView):
    def post(self, request):
        serializer = StockPredictionSerializer(data = request.data)
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker']

            # Fetch the data from yfinance using tiker
            now = datetime.now()
            start = datetime(now.year-10, now.month, now.day) # year-10= 10 year before
            end = now
            df = yf.download(ticker, start, end, auto_adjust=False)
            #print(df)
            if df.empty:
                return Response({"error" : "No  data found for the given Ticker", 
                                'status' : status.HTTP_404_NOT_FOUND})
            df = df.reset_index() # rest index into default
            #print(df)
            # Generate the Basic Plot
            # Need to switch from interactive to non-interactive backend(AGG). AGG is specifically design 
            # to save the plot in png or as an image file. The purpose of generate the plot and save the plot
            # in media file in our server and after that we will print the plot in the front-end
            plt.switch_backend('AGG') # AGG means Anti-Grain Geometry/non interactice backend(need to switch from interactive)
            plt.figure(figsize=(12, 5))
            plt.plot(df.Close, label='Closing Price')
            #plt.title(ticker)
            plt.title (f'Closing price of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()

            # Save the plot to a file. File need to save in media folder. Configuation need to set in settings.py and urls.py
            plt_img_path = f'{ticker}_plot.png' # set the image name

            # image_path = os.path.join(settings.MEDIA_ROOT, plt_img_path) # Set the fulll path of the image
            # plt.savefig(image_path)
            # plt.close()
            #plot_img = settings.MEDIA_URL + image_path
            #print(plot_img)
            plot_img = save_plot(plt_img_path)

            # 100 days moving average. create an utils.py to avoid repeating code
            ma100 = df.Close.rolling(100).mean()
            plt.switch_backend('AGG') 
            plt.figure(figsize=(12, 5))
            plt.plot(df.Close, label='Closing Price')
            plt.plot(ma100, 'r', label='100 DMA')
            #plt.title(ticker)
            plt.title (f'100 days moving average {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            # Save the image
            plt_img_path = f'{ticker}_100_dma.png'
            plot_100_dma = save_plot(plt_img_path)

            # 200 days moving average(DMA). create an utils.py to avoid repeating code
            ma200 = df.Close.rolling(200).mean()
            plt.switch_backend('AGG') 
            plt.figure(figsize=(12, 5))
            plt.plot(df.Close, label='Closing Price')
            plt.plot(ma100, 'r', label='100 DMA')
            plt.plot(ma200, 'g', label='200 DMA')
            #plt.title(ticker)
            plt.title (f'200 days moving average of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            # Save the image
            plt_img_path = f'{ticker}_200_dma.png'
            plot_200_dma = save_plot(plt_img_path)

            # Data Processing
            # Splitting the data into training and testing dataset
            data_training = pd.DataFrame(df.Close[0 : int(len(df)*0.7)])
            data_testing = pd.DataFrame(df.Close[int(len(df)*0.7) : int(len(df))])

            # Scaling down the data between 0 and 1
            scaler = MinMaxScaler(feature_range=(0,1))

            # Load ML model
            model = load_model('stock_prediction_model.keras')

            # Prepare the Test data to test against predication
            past_100_days = data_training.tail(100)

            # Adding past_100_days data with data_testing
            final_df = pd.concat([past_100_days, data_testing], ignore_index=True)

            # Scale this data to fit between 0 and 1
            input_data = scaler.fit_transform(final_df)

            # Create sequence. It's required because LSTM model expect data in a sequential manner
            x_test = []
            y_test = []
            for i in range(100, input_data.shape[0]):
                x_test.append(input_data[i-100 : i])
                y_test.append(input_data[i, 0]) # Here 0 present index
            x_test, y_test = np.array(x_test), np.array(y_test)

            # Making Prediction
            # Pass this sequence to prediction model
            y_predicated = model.predict(x_test)

            # Revert the scaled prices to original prices
            # We can't figure out the difference between y_predicted price(Predicate Price) and y_test(original price) that because these are all scable data 
            # means value between 0 and 1. In order to see the difference we need revert scaled data to original data, call it reverse transform

            y_predicated = scaler.inverse_transform(y_predicated.reshape(-1,1)).flatten() # -1 is to calculate number of rows based of length and number of columns, Flatten to convert the data into 1D array.1D array is easy to compare two price
            y_test = scaler.inverse_transform(y_test.reshape(-1,1)).flatten()

            # print('y-predicted==>', y_predicated)
            # print('y_test==>', y_test)

            # Plot the final prediction
            plt.switch_backend('AGG') 
            plt.figure(figsize=(12, 5))
            plt.plot(y_test, 'b', label='Original Price')
            plt.plot(y_predicated, 'r', label='Predicated Price')
            plt.title (f'Final Prediction for {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            # Save the image
            plt_img_path = f'{ticker}_final_prediction.png'
            plot_prediction = save_plot(plt_img_path)

            ## Model Evalution
            # Mean Squared Error(MSE)
            mse = mean_squared_error(y_test, y_predicated)

            # Root Mean Squared Error (RMSE)
            rmse = np.sqrt(mse)

            # R-Squared. It measure how our model prediction match the actual value
            r2 = r2_score(y_test, y_predicated) # the value should lies between 0 and 1. Value close 1 means more acurate value

        

            #return Response({'status': 'success', 'ticker': ticker})
            return Response({
                'status': 'success', 
                'plot_img': plot_img,
                'plot_100_dma': plot_100_dma,
                'plot_200_dma': plot_200_dma,
                'plot_prediction': plot_prediction,
                'mse': mse,
                'rmse': rmse,
                'r2': r2,
                })
