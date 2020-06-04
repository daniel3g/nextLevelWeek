import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet'
import { Link, useHistory } from 'react-router-dom';
import { FiArrowDownLeft } from 'react-icons/fi';
import api from '../../services/api';
import { LeafletMouseEvent } from 'leaflet';

import './styles.css';
import logo from '../../assets/logo.svg';
import axios from 'axios';

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint = () => {
const [items, setItems] = useState<Item[]>([]);
const [ufs, setUfs] = useState<string[]>([]);
const [cities, setCities] = useState<string[]>([]);

const [selectedUf, setSelectedUf] = useState('0');
const [selectedCity, setSelectedCity] = useState('0');
const [selectedItem, setSelectedItem] = useState<number[]>([]);
const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

const history = useHistory();

const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
})

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        })
    }, []);

    useEffect(() => {
        if(selectedUf === '0'){
            return
        }
        
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos`).then(response => {
            const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        })

    }, [selectedUf]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude, longitude]);
        })
    })

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target;

        setFormData({...formData, [name]: value});
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItem.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filteredItems = selectedItem.filter(item => item !== id);
            setSelectedItem(filteredItems);
        }else{
            setSelectedItem([...selectedItem, id]);
        }
    }

    async function hundleSubmit(event: FormEvent){
        event.preventDefault();
        
        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItem;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }

        await api.post('/points', data);

        alert('Ponto de coleta criado!');

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowDownLeft />
                    Voltar para Home
                </Link>
            </header>

            <form onSubmit={hundleSubmit}>
            <h1>Cadastro do <br /> ponto de coleta</h1>

            <fieldset>
                <legend>
                    <h2>Dados</h2>
                </legend>

                <div className="field">
                    <label htmlFor="name">Nome da entidade</label>
                    <input 
                    type="text"
                    name="name"
                    id="name"
                    onChange={handleInputChange}
                    />
                </div>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input 
                        type="email"
                        name="email"
                        id="email"
                        onChange={handleInputChange}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="name">WhatsApp</label>
                        <input 
                        type="text"
                        name="whatsApp"
                        id="whatsApp"
                        onChange={handleInputChange}
                        />
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>
                    <h2>Endereço</h2>
                    <span>Selecione um endereço no mapa</span>
                </legend>

                <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={selectedPosition}/>
                </Map>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="uf">Estado</label>
                        <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                            <option value="0">Selecione uma UF</option>

                            {ufs.map(uf => (
                                <option value={uf} key={uf}>{uf}</option>
                            ))}

                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                            <option value="0">Selecione uma Cidade</option>

                            {cities.map(city => (
                                <option value={city} key={city}>{city}</option>
                            ))}

                        </select>
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>
                    <h2>Itens de coleta</h2>
                    <span>Selecione um ou mais itens abaixo</span>
                </legend>

                <ul className="items-grid">
                    {items.map(item => (
                        <li 
                        key={item.id} 
                        onClick={() => 
                        handleSelectItem(item.id)}
                        className={selectedItem.includes(item.id) ? 'selected' : ''}
                        >
                        <img src={item.image_url} alt={item.title} />
                    <span>{item.title}</span>
                    </li> 
                    ))}          
                </ul>

            </fieldset>

            <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;