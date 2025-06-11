@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 
      الهوية اللونية الجديدة لـ "رايت واتر"
      الأزرق هو الأساسي (Primary) والأخضر هو الثانوي (Secondary)
    */
    --background: 0 0% 100%; /* خلفية بيضاء نظيفة */
    --foreground: 224 71.4% 4.1%; /* لون نص أسود داكن مائل للزرقة */

    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;

    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;

    --primary: 221 83% 53%; /* <-- اللون الأساسي: أزرق رايت واتر (#3A86FF) */
    --primary-foreground: 210 20% 98%; /* لون النص فوق الأساسي (أبيض) */

    --secondary: 142 41% 49%; /* <-- اللون الثانوي: أخضر رايت واتر (#78C091) */
    --secondary-foreground: 210 20% 98%; /* لون النص فوق الثانوي (أبيض) */

    --muted: 210 40% 96.1%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 20% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221 83% 53%; /* لون الـ ring يكون زي اللون الأساسي */

    --radius: 0.75rem; /* تعديل بسيط ليكون شكل الحواف أكثر نعومة */
  }

  .dark {
    /* 
      الوضع الليلي (Dark Mode) - مهم جداً يكون متناسق
    */
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;

    --card: 224 71.4% 4.1%;
    --card-foreground: 210 20% 98%;

    --popover: 224 71.4% 4.1%;
    --popover-foreground: 210 20% 98%;

    --primary: 221 83% 53%;
    --primary-foreground: 210 20% 98%;

    --secondary: 142 41% 49%;
    --secondary-foreground: 210 20% 98%;

    --muted: 215 27.9% 16.9%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 215 27.9% 16.9%;
    --accent-foreground: 210 20% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;

    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --ring: 221 83% 53%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
