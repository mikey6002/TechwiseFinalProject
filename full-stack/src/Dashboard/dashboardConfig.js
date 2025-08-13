//dashboard configuration
export const dashboardConfig = {
  
  // Dashboard header settings
  header: {
    title: "Dashboard", // dashboard title
  },
  
  // Color and styling theme
  theme: {
    gradientColors: {
      start: "#667eea",    // Starting color of gradient (blue)
      end: "#764ba2",      // Ending color of gradient (purple)  
      direction: "135deg"  // Gradient coloring direction
    },
    textColor: "white",              
    fontFamily: "Arial, sans-serif"  
  },
  
  // List of textboxes to display on the dashboard
  textboxes: [
    {
      id: "main-textbox",                        // Unique name for this textbox
      placeholder: "Paste your Terms of Service, Privacy Policy, or any legal text here for AI analysis...",    // Updated placeholder
      position: { top: "30%", left: "15%" },     // Adjusted to make room for file uploader
      size: "large",                           
      rows: 8,                                   // Number of rows (height)
      cols: 40,                                  // Number of columns (width)
      initialValue: "",                          // Starting text (empty by default)
    },
  ],

  //simple text elements
  textElements: [
    {
      id: "welcome-text",
      text: "Welcome to the TOS Dumbifier!\nThis is a simple tool to help you understand the Terms of Service of any website.",
      position: { top: "10%", left: "50%" },
      style: {
        fontSize: "1.5rem",
        textAlign: "center",
        transform: "translateX(-50%)"
      }
    },
    {
      id: "instruction-text", 
      text: "📝 Copy & Paste: Paste any legal text into the textbox below and click the ➤ button for AI analysis.\n📁 File Upload: Or use the file uploader on the right to analyze document files.",
      position: { top: "20%", left: "15%" },
      style: {
        fontSize: "1rem",
        lineHeight: "1.5"
      }
    }
  ]
};
