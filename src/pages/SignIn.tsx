import PageMeta from "../components/common/PageMeta";
import AuthLayout from "../components/auth/AuthPageLayout";
import SignInForm from "../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | RagPilot"
        description="Sign in to RagPilot to monitor and test your RAG pipeline."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
