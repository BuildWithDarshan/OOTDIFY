const clerkAppearance = {
  variables: {
    colorPrimary: "#0a3528",
    colorText: "#09261e",
    colorTextSecondary: "#61726b",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#09261e",
    borderRadius: "1rem",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card:
      "w-full rounded-[1.75rem] border border-[#d6e2dc] bg-white px-1 py-5 shadow-[0_20px_55px_rgba(16,50,39,.11)] sm:px-3 sm:py-6",
    main: "gap-3.5",
    header: "gap-1 pb-0",
    headerTitle:
      "font-display text-[1.75rem] font-normal italic tracking-[-0.02em] text-[#09261e] sm:text-[1.9rem]",
    headerSubtitle: "text-[0.82rem] leading-5 text-[#68766f]",
    socialButtons: "gap-2",
    socialButtonsBlockButton:
      "min-h-10 rounded-full border border-[#c8d9d0] bg-white text-[#153b30] shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4d8f73] hover:bg-[#f1f7f3] hover:shadow-sm",
    socialButtonsBlockButtonText: "font-medium",
    dividerRow: "my-1",
    dividerLine: "bg-[#d8e4de]",
    dividerText:
      "text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#7b8b84]",
    form: "gap-3",
    formFieldRow: "gap-1",
    formFieldLabel:
      "mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#315a4c]",
    formFieldInput:
      "min-h-10 rounded-xl border border-[#cadad2] bg-white px-4 text-sm text-[#09261e] shadow-none transition-all duration-300 focus:border-[#2f7f60] focus:ring-4 focus:ring-[#2f7f60]/10",
    formFieldInputShowPasswordButton:
      "text-[#547267] transition-colors hover:text-[#0a3528]",
    formButtonPrimary:
      "min-h-11 rounded-full bg-[#082b21] font-semibold tracking-[0.04em] text-white shadow-[0_8px_20px_rgba(8,43,33,.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3f9973] hover:shadow-[0_12px_26px_rgba(45,119,88,.24)]",
    footer: "bg-white pt-3",
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
