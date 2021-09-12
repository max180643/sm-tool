import { useState, useEffect } from 'react'
import QrReader from 'react-qr-reader'
import { Howl } from 'howler'

const App = () => {
  const [camera, setCamera] = useState(true)
  const [lastscan, setLastscan] = useState("")
  const [msg, setMsg] = useState("")

  const playDelay = 200
  const clearDelay = 2000
  const scanDelay = 500
  
  // data
  const defaultData = {
    kerry: {
      name: "Kerry",
      code: "SH",
      list: []
    },
    dhl: {
      name: "DHL",
      code: "59",
      list: []
    },
    flash: {
      name: "Flash",
      code: "TH",
      list: []
    },
    others: {
      name: "อื่นๆ",
      code: null,
      list: []
    },
  }

  const [data, setData] = useState(defaultData)

  const shipping = Object.keys(data).filter(word => word !== "others").sort()

  // localStorage
  const localName = 'smtool'

  const loadLocal = () => {
    const localData = localStorage.getItem(localName);
    if (localData) {
      setData(JSON.parse(localData))
    }
  }
  
  const setLocal = (data) => {
    localStorage.setItem(localName, JSON.stringify(data));
  }

  const removeLocal = () => {
    localStorage.removeItem(localName)
  }

  // initial data load
  useEffect(() => {
    loadLocal()
  }, [])

  // update localStorage
  useEffect(() => {
    setLocal(data)
  }, [data])

  // sound
  const beep = new Howl({
    src: ['./sound/beep.mp3']
  });

  const onScan = (scanData) => {
    if (scanData && scanData !== lastscan) {
      beep.play()

      const trackingNumber = scanData
      const shippingCode = trackingNumber.slice(0, 2) // get the first two character of string

      const saveData = (brand) => {
        if (!data[brand].list.includes(trackingNumber)) {
          setMsg(`${data[brand].name} : ${trackingNumber}`)
          setData({
            ...data,
            [brand]: {
              ...data[brand],
              list: [...data[brand].list, trackingNumber]
            }
          })
        } else {
          setTimeout(()=>{
            beep.play()
          }, (playDelay));
          setMsg(`${data[brand].name} : ${trackingNumber} ซ้ำ!`)
        }
      }

      const isOthers = shipping.every((brand) => {
        if (data[brand].code === shippingCode) {
          saveData(brand)
          return false
        }
        return true
      })

      if (isOthers) {
        saveData("others")
      }
      
      setLastscan(trackingNumber)
      setTimeout(() => {
        setLastscan("")
      }, (clearDelay))
      }
    }

  return (
    <div className="px-8 py-4">
      <h1 className="text-xl font-bold">SM-Tool</h1>
      <hr className="my-2" />

      {/* QRcode reader */}
      {
        camera && (
          <>
            <div className={"max-w-sm"}>
              <QrReader
                delay={scanDelay}
                onError={(err) => console.error(err)}
                onScan={onScan}
              />
              <p className="text-xl text-center mt-2">{msg}</p>
            </div>
            {/* Result data */}
            <hr className="my-2" />
          </>
        )
      }
          
      {/* Details */}
      <div>
        {
          shipping.map((brand) => (
              <p className="text-xl" key={data[brand].name}>{data[brand].name} ({data[brand].code ?? "-"}) : {data[brand].list.length} ชิ้น</p>
            )
          )
        }
        <p className="text-xl" key={data['others'].name}>{data['others'].name} ({data['others'].code ?? "-"}) : {data['others'].list.length} ชิ้น</p>
        <hr className="my-2" />
        <p className="text-xl">รวมทั้งหมด : {
          shipping.reduce((prev, current) => prev + data[current].list.length, 0)
        } ชิ้น</p>
      </div>

      {/* Camera button */}
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute bottom-0 right-0 mb-8 mr-4"
        onClick={() => {
          setCamera(!camera)
          setMsg("")
        }}
      >
        {!camera ? 'สแกน QRcode' : 'ปิดกล้อง'}
      </button>

      {/* Remove localStorage button */}
      <button 
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded absolute top-0 right-0 mt-2 mr-4"
        onClick={() => {
          removeLocal()
          setData(defaultData)
          setMsg("")
          setLastscan("")
        }}
      >
        X
      </button>
    </div>
  )
}

export default App;