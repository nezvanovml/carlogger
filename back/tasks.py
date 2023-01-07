from app import celery, config

@celery.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={'max_retries': 5})
def send_email_hello(self, email, content = {}):
    return True
    # if response.status_code != 200:
    #     raise Exception("Sending sms. Got non-200 answer from service, will try again.")
