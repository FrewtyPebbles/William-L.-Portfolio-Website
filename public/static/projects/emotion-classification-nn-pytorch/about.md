# Face Emotion Classification Model

This model attempts to classify images of people's faces as angry, disgusted, fearful, happy, neutral, sad, or surprised.  I built this model out of curiosity and to learn before I knew a lot of the things I know now about deep learning, data processing techniques, data collection, and AI in general.  This project taught me how convolutional layers in a neural network capture and segment feature based information in contrast to a standard linear fully connected layer.  Additionally I learned how max pooling can be used to make the network more invariant to small changes in the input tensor.  This helps to remove noise and makes it more robust against changes in the location of features.

## How it works

The network has the following layers to support image segmentation and reasoning:

 1. **Input** : A 48x48 pixel grayscale image.
 2. **Convolutional Layer** : This layer attempts to segment the images by sliding a different 3x3 kernel across across the image 16 times with a stride of 1 (one pixel at a time) and performing a dot product between the kernel and that section of the tensor's 2D layer.  That dot product represents how well this section of the tensor layer aligns with the pattern learned by the kernel.  These dot products make up a feature map matrix of the image.  These kernels are then trained during back propagation to hopefully learn classifying features.
 3. **Max Pooling 2D Layer** : This layer's goal is to make the model invariant to small amounts of noise and changes in feature position. It slides a 2x2 kernel across each feature map of the previous layer with a stride of 2, getting the maximum value of each kernel sample. This also improves performance by reducing the input dimension for the next layer.
 4. **Fully Connected Linear Layer** : The output dimensions of the previous layer are flattened then fed into this fully connected linear layer.  This layer is here to learn and perform reasoning using the high level features found in the convolutional layer. Since the dimensions of the input were halved in the max pooling layer across 16 feature maps from the convolutional layer, the input dimension of this layer is 16 * 24 * 24 and the output dimension is the number of classes (7).

## What I Would Do Differently

If I were to redo this project, I would start with more reliable authoritative sources of data only from educational, government, or other peer reviewed sources.  I would experiment with feature reduction utilizing facial landmark detection models and libraries like [MediaPipe](https://github.com/google-ai-edge/mediapipe).  A smaller input dimension would improve generalization by reducing random noise. I would use methods like Spearman Correlation to remove redundant features or PCA to transform features into a lower-dimensional space.  I would remove data points that have a high mean squared error after I scale and project them onto the Principal Component eigenvectors that explain 95% of the variance then inverse transformed them back (reconstruction error).  Additionally I would do **A LOT** of data visualization to better understand the performance and data related needs of my neural network.

## How To Train

To train this neural network, install the dependencies in `requirements.txt` and run the jupyter notebook. The compiled weights file will save to `"emotion_recognition_model.onnx"`.