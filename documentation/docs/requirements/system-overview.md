---
sidebar_position: 1
---

# System Overview

# Project Abstract
Understanding legal documents can be challenging due to the complexity of legal jargon and technical terminology. This project aims to develop an interactive web application that simplifies legal language, making it more accessible and understandable to the general public. The platform will allow users to upload or input legal documents, which will then be analyzed and translated into plain, easy-to-understand text.

The solution integrates multiple technologies: Dictionary API to provide precise definitions of complex legal terms. AI-based Natural Language Processing (NLP) API to interpret, summarize, and simplify legal content without altering its meaning.

Interactive Highlighting to allow users to select and focus on specific sections or terms for deeper clarification.

By combining AI-driven translation with legal term referencing, the application enhances transparency and reduces confusion, empowering users to make informed decisions without requiring extensive legal knowledge. The system will be designed with an intuitive user interface, ensuring accessibility and ease of use for individuals, businesses, and legal professionals.

This project addresses a critical need for legal literacy by bridging the gap between complex legal language and everyday understanding.

# Conceptual Design
The app will be available on through a webpage on a desktop or laptop. We will be using React to build the app.
The application is structured into three main layers: User Interaction Layer, Processing Layer, and Data Layer

Front end: The user will be prompted to sign up to create an account if not done so already. If the user has an account they are able to login and be greeted to the dashboard. On the dashboard users can copy and paste text to a text box or even upload a file. Currently accepting .txt,pdf,doc,and docx files only. 
Processing Layer (Backend)
Text Extraction: Extract text from uploaded documents using a parser (e.g., PDF to text).

Complex Term Detection: Identify legal jargon using a legal term dictionary or keyword matching.

AI/NLP Simplification: Send extracted text to an AI API (e.g., OpenAI GPT) for summarization and plain-language translation.

Dictionary Integration:For each term, fetch detailed definitions from a Dictionary API or legal glossary database.

Highlight Mapping: Map simplified terms back to their positions in the original text for interactive highlighting.

APIs and Data Sources: Dictionary API for definitions. AI API (NLP) for summarization and simplification.

Database: Store user history, documents, and simplified outputs for future reference.