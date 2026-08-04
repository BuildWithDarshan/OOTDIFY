const clerkAppearance = {
  variables: {
    colorPrimary: "#0a3528",
    colorText: "#09261e",
    colorTextSecondary: "#61726b",
    colorBackground: "#fbfaf5",
    colorInputBackground: "#ffffff",
    colorInputText: "#09261e",
    borderRadius: "1rem",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card:
      "w-full rounded-[1.85rem] border border-[#d6e4dc] bg-[#fbfaf5] shadow-none sm:px-2",
    header: "gap-1.5 pb-2",
    headerTitle:
      "font-display text-[2rem] font-normal italic tracking-[-0.02em] text-[#09261e] sm:text-[2.25rem]",
    headerSubtitle: "text-sm leading-6 text-[#68766f]",
    socialButtonsBlockButton:
      "min-h-12 rounded-full border border-[#c8d9d0] bg-white text-[#153b30] shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4d8f73] hover:bg-[#edf7ef] hover:shadow-md",
    socialButtonsBlockButtonText: "font-medium",
    dividerLine: "bg-[#d8e4de]",
    dividerText:
      "text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#7b8b84]",
    formFieldLabel:
      "mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#315a4c]",
    formFieldInput:
      "min-h-12 rounded-xl border border-[#cadad2] bg-white px-4 text-[#09261e] shadow-none transition-all duration-300 focus:border-[#2f7f60] focus:ring-4 focus:ring-[#2f7f60]/10",
    formFieldInputShowPasswordButton:
      "text-[#547267] transition-colors hover:text-[#0a3528]",
    formButtonPrimary:
      "min-h-12 rounded-full bg-[#082b21] font-semibold tracking-[0.04em] text-white shadow-[0_10px_24px_rgba(8,43,33,.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3f9973] hover:shadow-[0_14px_30px_rgba(45,119,88,.28)]",
    footer: "bg-transparent pt-5",
    footerAction: "text-[#6b7973]",
    footerActionLink:
      "font-semibold text-[#176b4e] transition-colors hover:text-[#0a3528]",
    formFieldErrorText: "text-red-700",
    alert: "rounded-xl border border-red-200 bg-red-50",
    identityPreview: "rounded-xl border border-[#cadad2] bg-white",
    formResendCodeLink: "font-semibold text-[#176b4e]",
  },
};

export default clerkAppearance;
