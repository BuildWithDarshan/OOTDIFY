const clerkAppearance = {
  variables: {
    colorPrimary: "var(--color-accent)",
    colorText: "var(--color-text-primary)",
    colorTextSecondary: "var(--color-text-secondary)",
    colorBackground: "var(--color-bg)",
    colorInputBackground: "var(--color-bg)",
    colorInputText: "var(--color-text-primary)",
    borderRadius: "1rem",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    rootBox: "!flex !w-full !justify-center",
    cardBox: "!mx-auto !w-full !max-w-[30rem] !shadow-none",
    card:
      "!w-full !rounded-[1.75rem] !border !border-border/80 !bg-bg !p-5 !shadow-[0_12px_38px_rgba(8,28,21,0.06)] sm:!p-6",
    main: "!gap-3.5",
    header: "!gap-1 !pb-0",
    headerTitle:
      "!font-display !text-[1.75rem] !font-normal !italic !tracking-[-0.02em] !text-text-primary sm:!text-[1.9rem]",
    headerSubtitle: "!text-[0.82rem] !leading-5 !text-text-secondary",
    socialButtons: "!gap-2",
    socialButtonsBlockButton:
      "!min-h-10 !rounded-full !border !border-border !bg-bg !text-text-secondary !shadow-none !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-accent hover:!bg-bg-subtle hover:!text-accent-hover hover:!shadow-md",
    socialButtonsBlockButtonText: "!font-medium",
    dividerRow: "!my-1",
    dividerLine: "!bg-border",
    dividerText:
      "!text-[0.65rem] !font-semibold !uppercase !tracking-[0.2em] !text-text-muted",
    form: "!gap-3",
    formFieldRow: "!gap-1",
    formFieldLabel:
      "!mb-1.5 !text-xs !font-medium !normal-case !tracking-normal !text-text-secondary",
    formFieldInput:
      "!min-h-11 !rounded-xl !border !border-border !bg-bg !px-4 !text-sm !text-text-primary !shadow-none !transition-all !duration-300 hover:!border-border-strong focus:!border-accent focus:!ring-4 focus:!ring-accent/10",
    formFieldInputShowPasswordButton:
      "!text-text-muted !transition-colors hover:!text-accent-hover",
    formButtonPrimary:
      "!min-h-11 !rounded-full !bg-text-primary !font-medium !tracking-normal !text-bg !shadow-none !transition-all !duration-300 hover:!-translate-y-0.5 hover:!bg-accent hover:!text-on-accent hover:!shadow-lg",
    footer: "!bg-bg !pt-3",
    footerAction: "!text-text-secondary",
    footerActionLink:
      "!font-medium !text-accent-hover !transition-colors hover:!text-text-primary",
    formFieldErrorText: "text-red-700",
    alert: "rounded-xl border border-red-200 bg-red-50",
    identityPreview: "!rounded-xl !border !border-border !bg-bg-subtle",
    formResendCodeLink: "!font-medium !text-accent-hover",
  },
};

export default clerkAppearance;
