# 🤖 OpenAI Chatbot Integration Guide

Your CareMatch chatbot is now **AI-powered with OpenAI GPT-3.5**! Here's how to set it up:

---

## 📋 Step 1: Get Your OpenAI API Key

1. Go to: **https://platform.openai.com/api-keys**
2. Sign up or log in to your OpenAI account
3. Click **"Create new secret key"**
4. Copy the key (keep it safe!)

---

## 🔑 Step 2: Add Your API Key

Open `frontend/.env` and replace:

```
VITE_OPENAI_KEY=your_openai_api_key_here
```

With your actual key:

```
VITE_OPENAI_KEY=sk-proj-abc123xyz...
```

**⚠️ IMPORTANT:** Never commit this file to git! It's in `.gitignore` to protect your key.

---

## 🚀 Step 3: Restart Your Frontend

Kill the current frontend server and restart:

```bash
cd frontend
npm run dev
```

---

## ✨ Features

✅ **AI-Powered Responses** - GPT-3.5 understands context  
✅ **Smart Context** - Knows all about CareMatch system  
✅ **Close Button (✕)** - Click the X in top-right to close  
✅ **ESC Key Support** - Press ESC to close  
✅ **Typing Animation** - Shows when AI is thinking  
✅ **Auto-Scrolling** - Always shows latest messages  
✅ **Disabled State** - Input disables while loading  
✅ **Clinical Blue Theme** - Matches your app design  

---

## 🎮 How to Use

1. Refresh your browser at **http://localhost:3000**
2. Click the **💬** button in the bottom-right corner
3. Type any question about CareMatch:
   - "How does the system work?"
   - "What does urgency mean?"
   - "How is the match score calculated?"
   - "Tell me about caregivers"
   - Or anything else!
4. Close with the **✕ button** or press **ESC**

---

## ⚙️ Configuration

The chatbot is configured with:

- **Model**: GPT-3.5-turbo (fast and reliable)
- **Max tokens**: 150 (keeps responses concise)
- **Temperature**: 0.7 (balanced creativity)
- **Context**: Includes conversation history for continuity

---

## 💰 Cost

- OpenAI charges per token used
- The chatbot uses very few tokens (max 150 per response)
- **Typical cost**: Less than $1 per 1,000 messages
- Check your usage: https://platform.openai.com/account/billing/overview

---

## ❌ Troubleshooting

### "API key not configured"
- Edit `frontend/.env` and paste your real API key
- Restart the frontend server (`npm run dev`)

### "API error" or timeout
- Check your internet connection
- Verify your API key is correct
- Check OpenAI status: https://status.openai.com

### Close button doesn't work
- Make sure you can see the **✕** button in the top-right of the chat
- Click it directly
- Or press **ESC** on your keyboard

### Chatbot not responding
- Check browser console for errors (F12 → Console)
- Make sure your API key has available credits
- Try asking a simpler question first

---

## 🔒 Security Best Practices

✓ **Never commit `.env`** - It's in `.gitignore`  
✓ **Keep your key private** - Don't share it online  
✓ **Rotate keys regularly** - Delete old ones  
✓ **Monitor usage** - Check if API usage looks unusual  

---

## 🎯 Next Steps

- The chatbot learns from your questions!
- You can add more context to the system prompt in `Chatbot.jsx`
- Later: Save conversation history to database
- Later: Use GPT-4 for even better responses

---

**Your AI assistant is now live! 🚀 Enjoy!**
