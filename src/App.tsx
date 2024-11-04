import React, { useState } from "react";
import styles from "./App.module.css";
import * as XLSX from "xlsx";

interface ScanData {
  id: number;
  serialNumber: string;
  link?: string;
}

export default function App() {
  const [scanData, setScanData] = useState<ScanData[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  // Функция parseScannedData: извлекает серийный номер и ссылку, если они присутствуют
  const parseScannedData = (data: string) => {
    const match = data.match(/^([A-Za-z0-9]+)\s*(https?:\/\/[^\s]+)?$/);
    return match ? { serialNumber: match[1], link: match[2] } : null;
  };

  // Функция handleScannedData: добавляет данные в массив scanData
  const handleScannedData = (data: string) => {
    const parsedData = parseScannedData(data);
    if (parsedData) {
      setScanData((prevData) => [
        ...prevData,
        { id: prevData.length + 1, ...parsedData },
      ]);
      setInputValue(""); // Очищаем поле после добавления данных
    } else {
      console.error("Неверный формат данных");
    }
  };

  // Функция handleInputChange: сохраняет данные поля ввода, приводит их к латинице
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;
    // Замена кириллицы на латиницу
    newValue = newValue.replace(/[А-Яа-яЁё]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x410 + 0x41)
    );
    setInputValue(newValue);
  };

  // Функция handleKeyDown: проверяет нажатие клавиши Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Проверяем нажатие Enter или пробела
    if (event.key === "Enter" || event.key === " ") {
      handleScannedData(inputValue);
      event.preventDefault(); // Предотвращаем поведение пробела
    }
  };

  // Функция exportToExcel: экспортирует данные в Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(scanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Сканированные данные");
    XLSX.writeFile(wb, "scan_data.xlsx");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Сканер оборудования</h1>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Сканируйте здесь..."
        className={styles.input}
      />
      <button onClick={exportToExcel} className={styles.exportButton}>
        Экспорт в Excel
      </button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>№</th>
            <th>Серийный номер</th>
            <th>Ссылка</th>
          </tr>
        </thead>
        <tbody>
          {scanData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.serialNumber}</td>
              <td>
                {item.link ? (
                  <button
                    className={styles.linkButton}
                    onClick={() => window.open(item.link, "_blank")}
                  >
                    Открыть ссылку
                  </button>
                ) : (
                  "Нет ссылки"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
