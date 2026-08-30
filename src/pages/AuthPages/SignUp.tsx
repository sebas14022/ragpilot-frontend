import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | RagPilot"
        description="Create an account on RagPilot to monitor and test your RAG pipeline."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
