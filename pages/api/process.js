import formidable from "formidable-serverless";
import {s3Upload} from "@/s3services";

const PREDICTION_URL = 'https://api.replicate.com/v1/predictions'
const GFPGAN_VERSION = '9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3'

export const config = {
	api: {
		bodyParser: false
	}
}

const createPrediction = async (url) => {
	let response = await fetch(PREDICTION_URL, {
		method: 'POST',
		body: JSON.stringify({
			version: GFPGAN_VERSION,
			input: {
				img: url,
			}
		}),
		headers: {
			'Content-type': 'application/json',
			'Authorization': `Token ${process.env.REPLICATE_TOKEN}`
		}
	})

	if (response.ok) {
		return await response.json()
	} else {
		response = await response.json()
		console.log(response)
		throw new Error(response.detail)
	}
}

const getPrediction = async (id) => {
	const url = `${PREDICTION_URL}/${id}`
	let response = await fetch(url, {
		headers: {
			'Content-type': 'application/json',
			'Authorization': `Token ${process.env.REPLICATE_TOKEN}`
		}
	})

	if (response.ok) {
		return await response.json()
	} else {
		response = await response.json()
		console.log(response)
		throw new Error(response.detail)
	}
}

export default async function handler(req, res) {
	// 1. if POST call
	if (req.method === 'POST') {
		// 2. parse the incoming form data
		let form = new formidable.IncomingForm()

		form.parse(req, async (error, fields, files) => {
			try {
				if (error) {
					console.log('failed to parse form data')
					return res.status(500).json({message: 'failed to parse form data'})
				}

				const file = files.file

				if (!file) {
					return res.status(400).json({message: 'no file to process'})
				}

				// 3. upload the file to aws s3
				let data = await s3Upload(process.env.S3_BUCKET, file)

				// 4. create prediction
				const prediction = await createPrediction(data.Location)

				// 4. return the response
				return res.status(200).json({status: prediction.status, id: prediction.id})
			} catch (e) {
				console.log('--error--', e)
				return res.status(500).json({message: e.message})
			}
		})
	} else if (req.method === 'GET') {
		try {
			const {id} = req.query
			const prediction = await getPrediction(id)
			return res.json({prediction})
		} catch (e) {
			console.log(e.message)
			return res.status(400).json({message: e.message})
		}

	} else {
		return res.status(400).json({message: 'Method not allowed'})
	}

}
