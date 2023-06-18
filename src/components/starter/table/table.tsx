import { component$, useSignal, $, useTask$, useStore } from '@builder.io/qwik';
import GiaNuoc from './getDMucNuoc.json'

export interface IData {
  BTHANG_ID: number,
  DINH_MUC: number,
  DON_GIA: number,
  GIANHOMNN_ID: number,
  MA_NHOMNN: string,
  NGAY_HLUC: string,
  // DIEN_GIAI: string,
  // MA_NGIA: string,
  // MA_NN: string,
  // MO_TA: string,
  // NGAY_HHLUC: string,
  // STT_BTHANG: number
}

export const filterCondition = {
  groupCode: "SHBT",
  priceCode: 4707,
  yearApply: new Date().getFullYear().toString()
}

export default component$(() => {
  const store = useStore({ type: 'kWh', numUsed: [0,0,0,0,0,0], total: 0 });
  const signal = useSignal('https://calc.evn.com.vn/TinhHoaDon/api/getDMuc');
  const responseJson = useSignal<IData[]>([]);

  useTask$(async ({ track }) => {
    track(() => signal.value);
    const res = await fetch(signal.value);
    const json = await res.json();
    const dienBacThangData = [...json.Data.D_BAC_THANG]
    const filteredData = dienBacThangData.filter((d: IData) => 
      d.MA_NHOMNN && d.MA_NHOMNN === filterCondition.groupCode && 
      d.GIANHOMNN_ID && d.GIANHOMNN_ID === filterCondition.priceCode &&
      d.NGAY_HLUC && d.NGAY_HLUC.includes(filterCondition.yearApply)
    )
    responseJson.value = filteredData;
  });

  const handleInputChange = $((e: Event, el: HTMLInputElement) => {
    if (!el.value) {
      store.total = 0
      store.numUsed = [0,0,0,0,0,0]
      return
    }

    store.total = 0

    let num = parseFloat(el.value)
    store.numUsed = [0,0,0,0,0,0]
    const datas = store.type === 'kWh' ? responseJson.value : GiaNuoc
    datas && datas.map((d: IData, index: number) => {
      if (!d || num < 1) return

      if (index >= datas.length - 1) {
        console.log(index)
        store.numUsed[index] = num * d.DON_GIA
        store.total += store.numUsed[index]
        return
      }

      if (num <= d.DINH_MUC) {
        store.numUsed[index] = num * d.DON_GIA
        num = 0
      } else {
        store.numUsed[index] = d.DINH_MUC * d.DON_GIA
        num = num - d.DINH_MUC
      }

      store.total += store.numUsed[index]
    })
  })

  const changeType = $((type: string) => {
    store.type = type
  })

  return (
      <>
        <div class="flex items-center justify-center mb-10 gap-10">
          <button class={`text-white font-bold py-2 px-4 rounded ${store.type === 'kWh' ? 'bg-blue-600' : 'bg-blue-300'}`} onClick$={() => changeType('kWh')}>Điện</button>
          <button class={`text-white font-bold py-2 px-4 rounded ${store.type === 'm3' ? 'bg-blue-600' : 'bg-blue-300'}`} onClick$={() => changeType('m3')}>Nước</button>
        </div>

        <label class="cursor-pointer flex flex-wrap gap-4 md:justify-center items-center mb-10">
          <div class="text-xl"><span class="text-red-600 font-bold">*</span> Điền vào số sử dụng:</div>
          <input class="h-10 px-3 text-black border-2 border-black" type="text"
            onInput$={handleInputChange} />
        </label>
        <h3 class="text-xl font-bold md:text-center mb-10">
          Tổng cộng: {store.total}
          {
            store.type === 'kWh' && 
            <><br/>(VAT 10% = <span class="text-red-600">{(store.total * 1.1).toFixed(0)} VNĐ)</span></>
          }
        </h3>

        <table class="w-full">
          <thead class="text-white text-sm bg-gray-400">
            <th class="py-2">Bậc thang</th>
            <th class="py-2">Đơn giá (VNĐ/{store.type})</th>
            <th class="py-2">Định mức ({store.type})</th>
            <th class="py-2">Thành tiền (VNĐ)</th>
          </thead>
          <tbody class="text-center">
            {store.type === 'kWh' && responseJson.value.map((d: IData, index: number) => d &&
              <tr key={d.BTHANG_ID} class="border-b border-gray-200">
                <td class="py-2">{index+1}</td>
                <td class="py-2">{d.DON_GIA}</td>
                <td class="py-2">{d.DINH_MUC > 0 ? d.DINH_MUC : store.numUsed[index] / d.DON_GIA}</td>
                <td class="py-2">{store.numUsed[index].toFixed(1)}</td>
              </tr>
            )}

            {store.type === 'm3' && GiaNuoc.map((d: IData, index: number) => d &&
              <tr key={d.BTHANG_ID} class="border-b border-gray-200">
                <td class="py-2">{index+1}</td>
                <td class="py-2">{d.DON_GIA}</td>
                <td class="py-2">{d.DINH_MUC > 0 ? d.DINH_MUC : store.numUsed[index] / d.DON_GIA}</td>
                <td class="py-2">{store.numUsed[index].toFixed(1)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </>
  );
});
