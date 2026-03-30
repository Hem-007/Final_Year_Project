import easyocr

reader = easyocr.Reader(['en'])

result = reader.readtext('job_test.png')

for text in result:
    print(text[1])