def get_val_prompt(job_title, job_description, question):
    prompt = f"""
    ####### INSTRUCTIONS START ####### 

    # Introduction

    #### some introduction here ####

    ### SAMPE JOB START #####
    Job Title: {job_title}
    Job Description: {job_description}

    ### SAMPE JOB END #####

    ## Our Tags =   "Computer Vision" , "OpenCV"  , "OCR"  , "Optical Character Recognition"  , "Video Analysis"  , "Video Surveillance"  ,"Object Detection"  ,"Emotion Recognition"  ,"Mediapipe"  ,"Augmented reality"  ,"Pose Detection" , "Pose Estimation" , "Facial recognition" , "Face detection" , "Image Processing"  NOT  "Image Editing"
    "Natural language processing" OR "GPT" OR   "ChatGPT" OR "entity recognition" OR "NLP" OR "Sentiment Analysis" OR "entity recognition" OR "NER" OR "hugging face" OR "Text Mining" OR "LLM" OR "Large Language Model"  OR "Chatbot" OR "Text Generation"  OR  "openai"

    Answer the following questions from given sample job:
    {question}

    ##NOTE:
    - If any question is not applicable or there is not information available about that question, just simply leave that question. Answer answer those which are present.
    - Return the answer in JSON format, which should include ID and Answer. For example:
    {{
      "ID-1" : {{"Answer" : "True"}},
      "ID-2" : {{"Answer" : "False"}}
      }}
    - MUST follow the above output format

    """

    return prompt
