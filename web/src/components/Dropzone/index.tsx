import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'

import './styles.css';

interface Props {
    onFiledUpload: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFiledUpload }) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('');
    
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];

        const fileUrl = URL.createObjectURL(file);

        setSelectedFileUrl(fileUrl);
        onFiledUpload(file);
    }, [onFiledUpload])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
            onDrop,
            accept: 'image/*'
        })

    return (
        <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} accept="image/*" />
       
        {selectedFileUrl        
                ?<img src={selectedFileUrl} alt="Image Tumnbnail" />
                :(
                isDragActive ?
                <p>Solte a imagem aqui ...</p> :
                <p>
                    <FiUpload />
                    Imagem do estabelecimento
                </p>
            )
        }
        </div>
    )
    }

    export default Dropzone;