import React, { useState } from "react";
import "./Rifa.css";

const NUM_ROWS = 10;
const NUM_COLS = 10;

const Rifa = () => {
    const [soldNumbers, setSoldNumbers] = useState([]); // Números ya asignados
    const [currentNumber, setCurrentNumber] = useState(null);
    const [numberData, setNumberData] = useState({}); // {numero: {name, phone}}
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const handleNumberClick = (num) => {
        setCurrentNumber(num);
        if (numberData[num]) {
            setName(numberData[num].name);
            setPhone(numberData[num].phone);
        } else {
            setName("");
            setPhone("");
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !currentNumber) return;
        setNumberData({ ...numberData, [currentNumber]: { name, phone } });
        if (!soldNumbers.includes(currentNumber)) {
            setSoldNumbers([...soldNumbers, currentNumber]);
        }
        setCurrentNumber(null);
        setName("");
        setPhone("");
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !currentNumber) return;
        setNumberData({ ...numberData, [currentNumber]: { name, phone } });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        if (!currentNumber) return;
        const newNumberData = { ...numberData };
        delete newNumberData[currentNumber];
        setNumberData(newNumberData);
        setSoldNumbers(soldNumbers.filter(num => num !== currentNumber));
        setCurrentNumber(null);
        setName("");
        setPhone("");
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
                        className={`rifa-cell ${isSold ? "just-saved" : ""} ${isSelected ? "selected" : ""}`}
                        onClick={() => handleNumberClick(cellNumber)}
                        id={`numero-${cellNumber}`}
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
            <h1>Rifa de Números</h1>
            <div className="rifa-table-wrapper">
                <table className="rifa-table">
                    <tbody>{renderTable()}</tbody>
                </table>
            </div>
            <form className="rifa-form" onSubmit={handleSave}>
                <h2>
                    {currentNumber
                        ? `Asignar o actualizar datos al número ${currentNumber}`
                        : "Selecciona un número"}
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
                <button type="submit" disabled={!currentNumber || !name.trim() || !phone.trim()}>
                    Guardar
                </button>
                <button
                    type="button"
                    disabled={
                        !currentNumber ||
                        !name.trim() ||
                        !phone.trim() ||
                        !soldNumbers.includes(currentNumber)
                    }
                    onClick={handleUpdate}
                >
                    Actualizar
                </button>
                <button
                    type="button"
                    disabled={
                        !currentNumber ||
                        !soldNumbers.includes(currentNumber)
                    }
                    onClick={handleDelete}
                >
                    Eliminar
                </button>
            </form>
        </div>
    );
};

export default Rifa;