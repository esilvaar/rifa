import React, { useState, useEffect } from "react";
import "./Rifa.css";

const NUM_ROWS = 10;
const NUM_COLS = 10;
const API_URL = "https://68433250e1347494c31f641f.mockapi.io/vendidos";

const Rifa = () => {
    // soldNumbers almacena los números de rifa (1-100) que están vendidos
    const [soldNumbers, setSoldNumbers] = useState([]);
    const [currentNumber, setCurrentNumber] = useState(null);
    // numberData mapea el número de rifa a sus datos, incluyendo el ID de la API
    // Ejemplo: { 42: { id: 'auto-id-de-api', nombre: '...', telefono: '...' } }
    const [numberData, setNumberData] = useState({});
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    // GET: Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Error al cargar datos");
                const data = await response.json();
                
                const newData = {};
                const newSoldNumbers = [];
                
                data.forEach(item => {
                    if (item.vendido) {
                        const raffleNumber = parseInt(item.numeroRifa, 10);
                        newSoldNumbers.push(raffleNumber);
                        newData[raffleNumber] = {
                            id: item.id, // ID único de la API
                            nombre: item.nombre,
                            telefono: item.telefono
                        };
                    }
                });
                setNumberData(newData);
                setSoldNumbers(newSoldNumbers);
            } catch (error) {
                console.error("Error en fetchData:", error);
            }
        };
        fetchData();
    }, []);

    const handleNumberClick = (num) => {
        setCurrentNumber(num);
        const dataForNumber = numberData[num];
        if (dataForNumber) {
            setName(dataForNumber.nombre);
            setPhone(dataForNumber.telefono);
        } else {
            setName("");
            setPhone("");
        }
    };

    // POST: Guarda un número por primera vez
    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim() || !currentNumber) return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numeroRifa: currentNumber.toString(),
                    nombre: name,
                    telefono: phone,
                    vendido: true,
                }),
            });
            if (!response.ok) throw new Error("Error en POST");
            const savedData = await response.json();
            
            const raffleNumber = parseInt(savedData.numeroRifa, 10);
            setSoldNumbers(prev => [...prev, raffleNumber]);
            setNumberData(prev => ({
                ...prev,
                [raffleNumber]: { id: savedData.id, nombre: savedData.nombre, telefono: savedData.telefono }
            }));
            
            alert(`Número ${raffleNumber} guardado!`);
            setCurrentNumber(null);
            setName("");
            setPhone("");

        } catch (error) {
            console.error("Error en handleSave:", error);
        }
    };
    
    // PUT: Actualiza un número ya vendido
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim() || !currentNumber || !soldNumbers.includes(currentNumber)) return;
        const { id } = numberData[currentNumber];

        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numeroRifa: currentNumber.toString(),
                    nombre: name,
                    telefono: phone,
                    vendido: true
                }),
            });
            setNumberData(prev => ({
                ...prev,
                [currentNumber]: { ...prev[currentNumber], nombre: name, telefono: phone }
            }));
            alert(`Número ${currentNumber} actualizado!`);
        } catch (error) {
            console.error("Error en handleUpdate:", error);
        }
    };

    // DELETE: Libera un número
    const handleDelete = async (e) => {
        e.preventDefault();
        if (!currentNumber || !soldNumbers.includes(currentNumber)) return;
        
        if (!window.confirm(`¿Seguro que quieres liberar el número ${currentNumber}?`)) {
            return;
        }

        const { id } = numberData[currentNumber];
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            
            setSoldNumbers(soldNumbers.filter(num => num !== currentNumber));
            const newNumberData = { ...numberData };
            delete newNumberData[currentNumber];
            setNumberData(newNumberData);
            
            setCurrentNumber(null);
            setName("");
            setPhone("");
        } catch (error) {
            console.error("Error en handleDelete:", error);
        }
    };

    const renderTable = () => {
        let rows = [];
        for (let i = 0; i < NUM_ROWS; i++) {
            let cols = [];
            for (let j = 0; j < NUM_COLS; j++) {
                const cellNumber = i * NUM_COLS + j + 1;
                const isSold = soldNumbers.includes(cellNumber);
                const isSelected = currentNumber === cellNumber;
                cols.push(
                    <td
                        key={cellNumber}
                        className={`rifa-cell ${isSold ? "sold" : ""} ${isSelected ? "selected" : ""}`}
                        onClick={() => handleNumberClick(cellNumber)}
                    >
                        {cellNumber}
                    </td>
                );
            }
            rows.push(<tr key={i}>{cols}</tr>);
        }
        return rows;
    };

    return (
        <div className="rifa-container">
            <h1>Rifa Club Río Toltén</h1>
            <div className="rifa-table-wrapper">
                <table className="rifa-table">
                    <tbody>{renderTable()}</tbody>
                </table>
            </div>
            <form className="rifa-form">
                <h2>
                    {currentNumber ? ` ${currentNumber}` : "Selecciona un número"}
                </h2>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={!currentNumber}
                />
                <input
                    type="tel"
                    placeholder="Teléfono"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={!currentNumber}
                />
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!currentNumber || !name.trim() || soldNumbers.includes(currentNumber)}
                >
                    Guardar
                </button>
                <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={!currentNumber || !name.trim() || !soldNumbers.includes(currentNumber)}
                >
                    Actualizar
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!currentNumber || !soldNumbers.includes(currentNumber)}
                >
                    Eliminar
                </button>
            </form>
        </div>
    );
};

export default Rifa;