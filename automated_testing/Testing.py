#install openpyxl and selenium, se non va prova a installare anche webdriver_manager
import openpyxl
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def extension_installation():
    print("Installing Chrome Extension")

    # Specify the path to the Chrome extension zip file
    extension_zip_path = os.getcwd() + '/extension.zip'
    
    # Unzip the extension to a temporary directory
    unzip_dir = os.getcwd() + '/extension'
    print(os.getcwd())

    # Create a ChromeOptions instance and add the extension from the unzipped directory
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_extension(extension_zip_path)

    return chrome_options

# Inizializza il driver Chrome
chrome_driver = webdriver.Chrome(options = extension_installation())
element_id = "NumDarkPattern"

file_excel = os.getcwd() + "\sites_list.xlsx"  # Sostituisci con il percorso del tuo file Excel
workbook = openpyxl.load_workbook(file_excel)
sheet = workbook.active

colonna_url = sheet['A']
colonna_result = sheet['B']
results = []

for cella in colonna_url:
    url = cella.value
    if url != None and url != 'Website URL':
        chrome_driver.get(url)

        element = WebDriverWait(chrome_driver, 10).until(
            EC.presence_of_element_located((By.ID, element_id))
        )
        
        div_element = chrome_driver.find_element(By.ID , element_id)
        div_content = div_element.text
        results.append(div_content)
        print(f"Trovati {div_content} dark pattern in {url}")

i = 0
for cella in colonna_result:
    if cella.value != '#DP':        
        if i < len(results):
            cella.value = None
            cella.number_format = '0'
            cella.value = int(results[i])
            i = i + 1

workbook.save(file_excel)
workbook.close()

# Chiudi il browser alla fine dell'esecuzione
chrome_driver.quit()





