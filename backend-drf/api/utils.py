import os
from django.conf import settings
import matplotlib.pyplot as plt

def save_plot(plt_img_path):
    image_path = os.path.join(settings.MEDIA_ROOT, plt_img_path) # Set the fulll path of the image
    plt.savefig(image_path)
    plt.close()
    image_url = settings.MEDIA_URL + image_path
    return image_url