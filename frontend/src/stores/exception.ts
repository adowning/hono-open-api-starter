// error handle function
export const handleException = (code: number): string => {
    switch (code) {
        case 0:
            return 'Error occurred'
        case 401:
            return 'The login account or password is incorrect'
        case 101004:
            return 'Credentials have expired. Please log in again'
        case 100000:
            return 'The provided data is invalid'
        case 100001:
            return 'Password does not meet the requirements'
        case 100002:
            return 'User account is locked'
        case 101001:
            return 'Login data is invalid'
        case 101002:
            return 'The login account or password is incorrect'
        case 101003:
            return 'Login account does not exist'
        case 102001:
            return 'Registration failed'
        case 102002:
            return 'Registration data is invalid'
        case 102003:
            return 'The account is already in use, please try another one'
        case 103001:
            return 'Invalid nickname format (invalid length or contains invalid characters)'
        case 103002:
            return 'Nickname cannot be the same as email'
        case 103003:
            return 'Invalid email format'
        case 103004:
            return 'Invalid phone number format'
        case 103005:
            return 'New password must be different from the current one'
        case 103006:
            return 'Current password is incorrect'
        case 103007:
            return 'New email cannot be the same as the current email'
        case 103008:
            return 'The information you are trying to update is already taken'
        case 103009:
            return 'Invalid avatar index'
        case 103010:
            return 'Invalid date of birth format'
        case 106001:
            return 'Depositor information not submitted'
        case 106002:
            return 'Duplicate depositor ID'
        case 106003:
            return 'Amount is outside the allowed range'
        case 106004:
            return 'Deposit failed'
        case 106005:
            return 'Invalid depositor ID format'
        case 106101:
            return 'Insufficient withdrawable amount'
        case 106202:
            return 'Deposit failed'
        case 107001:
            return 'VIP data error'
        case 107002:
            return 'VIP task error'
        case 107003:
            return 'Failed to claim VIP task'
        case 107004:
            return 'Failed to claim VIP reward'
        case 107005:
            return 'VIP reward already claimed'
        case 107006:
            return 'VIP task not found'
        case 107007:
            return 'VIP task reward already claimed'
        case 107008:
            return 'VIP task conditions not met'
        case 107009:
            return 'VIP check-in conditions not met'
        case 108001:
            return 'Invalid game ID'
        case 108002:
            return 'Invalid game pagination'
        case 108003:
            return 'Maximum page limit reached'
        case 108004:
            return 'Invalid game type'
        default:
            return 'An error occurred'
    }
}
