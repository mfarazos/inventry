export type SignInCredential = {
    email: string
    password: string
}
export interface SignInResponse {
    msg: string
    data: {
        _id: string
        fullName: string
        phoneNumber: string
        email: string
        isDeletedStatus: boolean
        isEmailVerified: boolean
        userName: string
        address: string
        country: string
        tokens: number
        role: string
        isPremium: boolean
        languagePreference: string
        level: number
        experience: number
        pointsScored: number
        accessToken: string
    }
}
export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    userName: string
    email: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}
