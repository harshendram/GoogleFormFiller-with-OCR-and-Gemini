



# Gemini Extension v1.0

Gemini Extension is a free, lightning-fast Chrome extension designed to automate Google Form completion. It fetches form data, autofills answers using advanced AI powered by the fine-tuned Gemini 2.0 Flash model, and caches responses for reliability. With robust OCR and multilingual support, it’s perfect for students and professionals who need a discreet, efficient way to handle lengthy forms.

---

## Key Features

- **Free & Fast**  
  • 100% free – no hidden costs  
  • Autofills forms in as little as **2.6 seconds** using an efficient batch processing system

- **Advanced AI & Image Processing**  
  • Powered by the fine-tuned **Gemini 2.0 Flash** model for highly accurate answers  
  • Advanced OCR extracts text from images in multiple languages (Hindi, Tamil, Kannada, Malayalam, Telugu, etc.) and preserves mathematical formulas perfectly

- **Robust Caching & Reliability**  
  • Auto-caching: If your form accidentally closes, your answers are saved and reloaded instantly  
  • “Oops! Got your form closed? Don't worry—your data is always ready and waiting.”

- **Stealth Keystroke Shortcuts**  
  • Use **Alt+A** to fetch form data discreetly  
  • Use **Alt+C** to trigger autofill instantly  
  • Perfect for those moments when you need to work under the radar

- **Efficient Batching System**  
  • Automatically splits large forms (60+ questions) into smaller batches for rapid, error-free processing without exceeding token limits

- **User-Friendly Interface**  
  • Supports both light and dark modes for a comfortable viewing experience  
  • Clean, minimal design optimized for students and busy professionals



## Installation

### Local Development
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/harshendram/chrome-ext-backend.git
   cd chrome-ext-backend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Run the Backend Locally:**
   ```bash
   npm start
   ```
   *(Ensure that your `tessdata` folder is in the correct location relative to your working directory.)*

### Chrome Extension Testing
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the upper right).
3. Click **Load unpacked** and select your extension folder containing the `manifest.json`.



## Usage

- **When you open a Google Form:**  
  Gemini Extension automatically detects the form and caches your answers.
  
- **To Fetch Data:**  
  Click the **Fetch Form Data** button or press **Alt+A** to retrieve your form data.
  
- **To Autofill:**  
  Click the **Auto Fill** button or press **Alt+C** to automatically fill in the form.

- **Discreet Operation:**  
  The extension is designed with stealth in mind, so your keystroke shortcuts keep your workflow smooth and unnoticed.



## Deployment on Render

Your backend is hosted on Render.com. Render automatically deploys changes when you push updates to your GitHub repository. For details, refer to our [Render Deployment Guide](#) (replace with your link if needed).



## Privacy Policy

Gemini Extension does not collect, store, or transmit any personal or sensitive information. All data is processed locally and any necessary data fetched from your backend is used solely for autofilling your forms.



## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.



## Roadmap

- Further improvements in batching and error handling  
- Enhanced UI customization options  
- Additional language support for OCR and form processing



*Gemini Extension v1.0 – Fast, accurate, and completely free. Get ready to breeze through your forms!*




### **Additional Notes:**

- **Version 1 Release:**  
  This README reflects the first public release of your extension.  
- **Customizations:**  
  You can update links, logos, and additional details as your project evolves.  
- **Deployment:**  
  Ensure your GitHub repository is set up with auto-deploy (if desired) so that updates are pushed automatically to Render.

