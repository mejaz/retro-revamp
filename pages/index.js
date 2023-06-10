import Head from 'next/head'
import FileUpload from "@/components/FileUpload";
import Intro from "@/components/Intro";
import {useEffect, useState} from "react";
import FileSaver from 'file-saver';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const downloadImage = (url) => {
	FileSaver.saveAs(url)
}

const ImageBox = ({image, alt, processing = false}) => (
	<div className={'relative w-full md:w-[48%]'}>
		{image
			? <button
				className={'absolute right-4 top-4 bg-purple-500 text-white px-2 py-1.5 rounded-md'}
				onClick={() => downloadImage(image)}>
				Download
			</button>
			: undefined
		}
		{
			image
				? <img src={image} alt={alt} className={'w-full h-auto shadow-md mx-auto border p-2'}/>
				: undefined
		}
		{
			processing
				? <div
					className={'absolute top-0 w-full h-full bg-zinc-500 opacity-75 flex justify-center items-center text-white font-semibold text-2xl tracking-widest'}>Processing...</div>
				: undefined
		}

	</div>
)


export default function Home() {
	const [originalImage, setOriginalImage] = useState()
	const [restoredImage, setRestoredImage] = useState()
	const [uploading, setUploading] = useState(false)
	const [predictId, setPredictId] = useState()

	useEffect(() => {
		let interval
		if (predictId) {
			const getPrediction = () => {
				fetch(`/api/process?id=${predictId}`, {
					headers: {
						'Content-type': 'application/json'
					}
				})
					.then(response => response.json())
					.then(data => {
						if (data.prediction.status === 'succeeded') {
							clearInterval(interval)
							setRestoredImage(data.prediction.output)
							setUploading(false)
						}
					})
					.catch(error => alert(error.message))
			}
			getPrediction()
			const interval = setInterval(getPrediction, 2000)
		}
		return () => {
			clearInterval(interval)
		}
	}, [predictId])

	return (
		<main className={`flex flex-col min-h-screen`}>
			<Head>
				<title>Retro Revamp - Restore Old Photos</title>
			</Head>
			<div className={'w-full flex-grow'}>
				<Header/>
				{/* content */}
				<div className={'mt-20 px-4 my-6'}>
					<div className={'max-w-5xl mx-auto'}>
						<Intro/>
						<div className={'w-full lg:w-2/3'}>
							<FileUpload
								setOriginalImage={setOriginalImage}
								uploading={uploading}
								setUploading={setUploading}
								setPredictId={setPredictId}
							/>
						</div>
						<div
							className={'flex justify-between lg:justify-center flex-wrap mt-3 gap-2 w-full min-h-[300px] lg:p-5'}>
							{
								originalImage
									? <ImageBox
										image={originalImage}
										alt={'original-pic'}
										processing={uploading}
									/>
									: <div className={"flex justify-center items-center w-full text-zinc-400"}>No Image To Show</div>
							}
							{
								restoredImage
									? <ImageBox
										image={restoredImage}
										alt={'restored-pic'}
									/>
									: undefined
							}
						</div>
					</div>
				</div>
			</div>
			<Footer/>
		</main>
	)
}
