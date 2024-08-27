import { drive_v3 } from "googleapis"

const { google } = require('googleapis')
const stream = require('stream')
const path = require('path')
const fs = require('fs')

const CLIENT_ID = '1097183035625-4eh1lml5fvc097luole5rr044m9a73o7.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'

const REFRESH_TOKEN = '1//04P6huKi4jx-0CgYIARAAGAQSNwF-L9Ir8cbeJS0X2PaL0UnpfiEz50f2igjk1pKlx9jA56XWCQaBiOj13hwt7Wdoj7l0kH52_8A'

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
)

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

const drive: drive_v3.Drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

export default drive