import { navigate } from "gatsby"
import { useAdminAcceptInvite } from "medusa-react"
import qs from "qs"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { decodeToken } from "react-jwt"
import Button from "../components/fundamentals/button"
import MedusaIcon from "../components/fundamentals/icons/medusa-icon"
import LoginLayout from "../components/login-layout"
import SigninInput from "../components/molecules/input-signin"
import SEO from "../components/seo"
import useNotification from "../hooks/use-notification"
import { getErrorMessage } from "../utils/error-messages"

type formValues = {
  email: string
  password: string
  repeat_password: string
  first_name: string
  last_name: string
}

const InvitePage = ({ location }) => {
  const parsed = qs.parse(location.search.substring(1))

  let token: Object | null = null
  if (parsed?.token) {
    try {
      token = decodeToken(parsed.token as string)
    } catch (e) {
      token = null
    }
  }

  const [passwordMismatch, setPasswordMismatch] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<formValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      password: "",
      repeat_password: "",
    },
  })
  const accept = useAdminAcceptInvite()

  const notification = useNotification()

  const handleAcceptInvite = (data: formValues) => {
    setPasswordMismatch(false)

    if (data.password !== data.repeat_password) {
      setPasswordMismatch(true)
      return
    }

    accept.mutate(
      {
        token: parsed.token as string,
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          password: data.password,
        },
      },
      {
        onSuccess: () => {
          navigate("/login")
        },
        onError: (err) => {
          notification("Error", getErrorMessage(err), "error")
        },
      }
    )
  }

  return (
    <LoginLayout>
      <SEO title="Create Account" />
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex min-h-[600px] bg-grey-0 rounded-rounded justify-center">
          <form
            className="flex flex-col py-12 w-full px-[120px] items-center"
            onSubmit={handleSubmit(handleAcceptInvite)}
          >
            <MedusaIcon />
            {!token ? (
              <div className="h-full flex flex-col gap-y-2 text-center items-center justify-center">
                <span className="inter-large-semibold text-rose-50">
                  You signup link is invalid
                </span>
                <span className="inter-base-regular">
                  Contact your administrator to obtain a valid signup link
                </span>
              </div>
            ) : (
              <>
                <span className="inter-2xlarge-semibold mt-4 text-grey-90">
                  Welcome to the team!
                </span>
                <span className="inter-base-regular text-grey-50 mt-2">
                  It's great to see you 👋🏼
                </span>
                <span className="inter-base-regular text-grey-50">
                  Create your account below
                </span>
                <SigninInput
                  placeholder="First name"
                  name="first_name"
                  ref={register({ required: true })}
                />
                <SigninInput
                  placeholder="Last name"
                  name="last_name"
                  ref={register({ required: true })}
                />
                <SigninInput
                  placeholder="Password"
                  type={"password"}
                  name="password"
                  ref={register({ required: true })}
                />
                <SigninInput
                  placeholder="Repeat password"
                  type={"password"}
                  name="repeat_password"
                  ref={register({ required: true })}
                />
                {passwordMismatch && (
                  <span className="text-rose-50 w-full mt-2 inter-small-regular">
                    These passwords do not match
                  </span>
                )}
                <Button
                  variant="primary"
                  size="large"
                  type="submit"
                  className="w-full mt-base"
                  loading={isSubmitting}
                >
                  Create account
                </Button>
              </>
            )}
          </form>
        </div>
      </div>
    </LoginLayout>
  )
}

export default InvitePage
