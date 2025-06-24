import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Login to AIMS</h1>
        <LoginForm />
      </div>
    </div>
  )
}
