import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import OrderStatusCard from "../components/OrderStatusCard";
import BestSellerCard from "../components/BestSellerCard";
import DemographicCard from "../components/DemographicCard";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import { API_URL } from "../constants/API";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Label,
  Pie,
  PieChart,
  Sector,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function SalesReport() {
  const userGlobal = useSelector((state) => state.users);
  const adminGlobal = useSelector((state) => state.admins);
  const [jumlahOrder, setJumlahOrder] = useState([]);
  const [warehouse, setWarehouse] = useState(0);
  const [bestSeller, setBestSeller] = useState([]);
  const [demographic, setDemographic] = useState([]);
  const [year, setYear] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState({
    year: 0,
    month: 0,
  });
  const [revenue, setRevenue] = useState([]);

  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#800000"];

  const fetchStatus = () => {
    axios
      .get(`${API_URL}/warehouses?idUser=${adminGlobal.idUser}`)
      .then((response) => {
        setWarehouse(response.data[0].idWarehouse);
        console.log(response.data[0].idWarehouse);
        axios
          .get(
            `${API_URL}/salesReport/transactionStatus?idWarehouse=${response.data[0].idWarehouse}`
          )
          .then((response) => {
            setJumlahOrder(response.data.results);
            console.log(response.data.results);
          })
          .catch((err) => {
            alert(err);
          });

        axios
          .get(
            `${API_URL}/salesReport/bestSelling?idWarehouse=${response.data[0].idWarehouse}`
          )
          .then((response) => {
            setBestSeller(response.data.results);
            console.log(response.data.results);
          })
          .catch((err) => {
            alert(err);
          });

        axios
          .get(
            `${API_URL}/salesReport/demographic?idWarehouse=${response.data[0].idWarehouse}`
          )
          .then((response) => {
            setDemographic(response.data.results);
            console.log(response.data.results);
          })
          .catch((err) => {
            alert(err);
          });

        axios
          .get(
            `${API_URL}/salesReport/yearRevenue?idWarehouse=${response.data[0].idWarehouse}`
          )
          .then((response) => {
            setRevenue(response.data.results);
            setYear(response.data.results);
            console.log(response.data.results);
          })
          .catch((err) => {
            alert(err);
          });
      })
      .catch((err) => {
        alert(err);
      });
  };

  //   const fetchMonth = (year) => {
  //     if (year === "allYears") {
  //       axios
  //         .get(`${API_URL}/salesReport/yearRevenue?idWarehouse=${warehouse}`)
  //         .then((response) => {
  //           setRevenue(response.data.results);
  //           setYear(response.data.results);
  //           console.log(response.data.results);
  //         })
  //         .catch((err) => {
  //           alert(err);
  //         });
  //     } else {
  //       axios
  //         .get(
  //           `${API_URL}/salesReport/monthRevenue?idWarehouse=${warehouse}&year=${year}`
  //         )
  //         .then((response) => {
  //           setRevenue(response.data.results);
  //           setMonth(response.data.results);
  //           setCurrentYear(year);
  //           console.log(response.data.results);
  //         })
  //         .catch((err) => {
  //           alert(err);
  //         });
  //     }
  //   };

  //   const fetchDay = (month) => {
  //     axios
  //       .get(
  //         `${API_URL}/salesReport/dayRevenue?idWarehouse=${warehouse}&year=${currentYear}&month=${month}}`
  //       )
  //       .then((response) => {
  //         setRevenue(response.data.results);
  //         setCurrentMonth(month);
  //         console.log(response.data.results);
  //       })
  //       .catch((err) => {
  //         alert(err);
  //       });
  //   };

  const applyButtonHandler = () => {
    if (!currentPeriod.year && !currentPeriod.month) {
      axios
        .get(`${API_URL}/salesReport/yearRevenue?idWarehouse=${warehouse}`)
        .then((response) => {
          setRevenue(response.data.results);
          setYear(response.data.results);
          console.log(response.data.results);
        })
        .catch((err) => {
          alert(err);
        });
    } else if (currentPeriod.year && !currentPeriod.month) {
      axios
        .get(
          `${API_URL}/salesReport/monthRevenue?idWarehouse=${warehouse}&year=${currentPeriod.year}`
        )
        .then((response) => {
          setRevenue(response.data.results);
          console.log(response.data.results);
        })
        .catch((err) => {
          alert(err);
        });
    } else if (currentPeriod.month && currentPeriod.year) {
      axios
        .get(
          `${API_URL}/salesReport/dayRevenue?idWarehouse=${warehouse}&year=${currentPeriod.year}&month=${currentPeriod.month}}`
        )
        .then((response) => {
          setRevenue(response.data.results);
          console.log(response.data.results);
        })
        .catch((err) => {
          alert(err);
        });
    }
    labelingCondition();
  };

  const renderOrder = () => {
    return jumlahOrder.map((val) => {
      return (
        <OrderStatusCard status={val.status} jumlahOrder={val.jumlahOrder} />
      );
    });
  };

  const renderBestSeller = () => {
    return bestSeller.map((val) => {
      return (
        <BestSellerCard
          productImage={val.productImage}
          productName={val.productName}
          soldQuantity={val.soldQuantity}
        />
      );
    });
  };
  const renderDemographic = () => {
    return demographic.map((val) => {
      return <DemographicCard kota={val.kota} revenueKota={val.revenueKota} />;
    });
  };

  const inputHandler = (event) => {
    const value = event.target.value;
    const name = event.target.name;

    console.log(name);
    console.log(value);

    setCurrentPeriod({ ...currentPeriod, [name]: parseInt(value) });
  };

  const labelingCondition = () => {
    if (currentPeriod.month && currentPeriod.year) {
      return "Date";
    } else if (!currentPeriod.year && !currentPeriod.month) {
      return "Year";
    } else if (currentPeriod.year && !currentPeriod.month) {
      return "Month";
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);
  return (
    <div>
      <div>
        <h1 style={{ marginTop: 30, marginLeft: 68 }}>ONGOING ORDERS</h1>
        <div className="d-flex flex-wrap justify-content-evenly p-4">
          {renderOrder()}
        </div>
      </div>

      <div className="d-flex flex-column card card-body shades my-2 align-items-center">
        <h4 className="display-5 mt-4">Best Selling Items</h4>

        <div className="d-flex flex-row justify-content-between p-4">
          <div>
            <BarChart
              style={{ height: 500, marginTop: 30 }}
              width={600}
              height={450}
              data={bestSeller}
              margin={{
                top: 5,
                bottom: 5,
              }}
              barSize={50}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis className="m-4" dataKey="productName"></XAxis>
              <YAxis dataKey="soldQuantity" />
              <Tooltip />
              {/* <Legend /> */}
              <Bar dataKey="soldQuantity" fill="#32b280" />
            </BarChart>
          </div>

          <div
            style={{ height: 500, marginTop: 30, marginLeft: 20, width: 500 }}
          >
            {renderBestSeller()}
          </div>
        </div>
      </div>

      <div className="d-flex flex-row">
        <div
          style={{ height: 800, width: 600 }}
          className="d-flex flex-column card card-body mx-2 shades align-items-center"
        >
          <h4 className="display-5 mt-4">Total Revenue by City</h4>
          <div className="d-flex flex-column justify-content-between align-items-center p-4">
            <PieChart width={850} height={350}>
              <Pie
                data={demographic}
                isAnimationActive={false}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={0}
                dataKey="revenueKota"
                label={(entry) => entry.kota}
              >
                {demographic.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
                <Tooltip />
              </Pie>
            </PieChart>
            <div style={{ height: 500, width: 500 }}>{renderDemographic()}</div>
          </div>
        </div>

        <div
          style={{ width: 800, height: 800 }}
          className="d-flex flex-column card card-body shades mx-2 justify-content-center align-items-center"
        >
          <h4 className="display-5">Total Revenue by Period</h4>
          <div className="d-flex flex-row align-self-end justify-content-center my-4">
            <div>
              <select
                name="month"
                style={{ width: 200 }}
                className="form-select box-shadow "
                onChange={inputHandler}
              >
                <option value="0">All Months</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
            <div className="">
              <select
                name="year"
                style={{ width: 200 }}
                className="form-select box-shadow"
                onChange={inputHandler}
              >
                <option value="0">All years</option>
                {year.map((val) => {
                  return (
                    <option value={parseInt(val.period)}>{val.period}</option>
                  );
                })}
              </select>
            </div>

            <div>
              <button
                className="btn btn-success"
                disabled={!currentPeriod.year && currentPeriod.month}
                onClick={applyButtonHandler}
              >
                Apply
              </button>
            </div>
          </div>

          <div className="">
            <LineChart
              width={750}
              height={550}
              data={revenue}
              margin={{
                top: 40,
                bottom: 30,
                left: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period">
                <Label
                  value={labelingCondition()}
                  offset={-15}
                  position="insideBottom"
                />
              </XAxis>
              <YAxis
                label={{
                  value: "Revenue of the period",
                  angle: -90,
                  position: "insideLeft",
                  offset: -40,
                }}
              />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenueOfThePeriod"
                stroke="#82ca9d"
              />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  );
}

// switch (true) {
//     case !currentPeriod.year && !currentPeriod.month:
//       axios
//         .get(`${API_URL}/salesReport/yearRevenue?idWarehouse=${warehouse}`)
//         .then((response) => {
//           setRevenue(response.data.results);
//           setYear(response.data.results);
//           console.log(response.data.results);
//         })
//         .catch((err) => {
//           alert(err);
//         });
//       break;

//     case currentPeriod.year && !currentPeriod.month:
//       axios
//         .get(
//           `${API_URL}/salesReport/monthRevenue?idWarehouse=${warehouse}&year=${currentPeriod.year}`
//         )
//         .then((response) => {
//           setRevenue(response.data.results);
//           console.log(response.data.results);
//         })
//         .catch((err) => {
//           alert(err);
//         });
//       break;

//     case currentPeriod.month && currentPeriod.year:
//       axios
//         .get(
//           `${API_URL}/salesReport/dayRevenue?idWarehouse=${warehouse}&year=${currentPeriod.year}&month=${currentPeriod.month}}`
//         )
//         .then((response) => {
//           setRevenue(response.data.results);
//           console.log(response.data.results);
//         })
//         .catch((err) => {
//           alert(err);
//         });
//       break;

//     default:
//       break;
//   }