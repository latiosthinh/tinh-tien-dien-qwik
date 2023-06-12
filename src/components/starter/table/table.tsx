import { component$, useSignal, $, useTask$, useStore } from '@builder.io/qwik';

export interface IData {
  BTHANG_ID: number,
  DIEN_GIAI: string,
  DINH_MUC: number,
  DON_GIA: number,
  GIANHOMNN_ID: number,
  MA_NGIA: string,
  MA_NHOMNN: string,
  MA_NN: string,
  MO_TA: string,
  NGAY_HHLUC: string,
  NGAY_HLUC: string,
  STT_BTHANG: number
}

export const filterCondition = {
  groupCode: "SHBT",
  priceCode: 4707,
  yearApply: new Date().getFullYear().toString()
}

export default component$(() => {
  const url = useSignal('https://calc.evn.com.vn/TinhHoaDon/api/getDMuc');
  const responseJson = useSignal<IData[]>([]);

  useTask$(async ({ track }) => {
    track(() => url.value);
    const res = await fetch(url.value);
    const json = await res.json();
    const dienBacThangData = [...json.Data.D_BAC_THANG]
    const filteredData = dienBacThangData.filter((d: IData) => 
      d.MA_NHOMNN && d.MA_NHOMNN === filterCondition.groupCode && 
      d.GIANHOMNN_ID && d.GIANHOMNN_ID === filterCondition.priceCode &&
      d.NGAY_HLUC && d.NGAY_HLUC.includes(filterCondition.yearApply)
    )
    responseJson.value = filteredData;
  });

  const store = useStore({ numUsed: [0,0,0,0,0,0], total: 0 });
  const handleInputChange = $((e: Event, el: HTMLInputElement) => {
    if (!el.value) {
      store.total = 0
      store.numUsed = [0,0,0,0,0,0]
      return
    }

    store.total = 0

    let num = parseFloat(el.value)
    store.numUsed = [0,0,0,0,0,0]
    responseJson.value && responseJson.value.map((d: IData, index: number) => {
      if (!d || num < 1) return

      if (index >= store.numUsed.length - 1) {
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

  return (
    <>
      <label class="cursor-pointer flex flex-wrap gap-4 md:justify-center items-center mb-10">
        <div class="text-xl"><span class="text-red-600 font-bold">*</span> Điền vào số điện sử dụng:</div>
        <input class="h-10 px-3 text-black border-2 border-black" type="text"
          onInput$={handleInputChange} />
      </label>
      <h3 class="text-xl font-bold md:text-center mb-10">Tổng cộng: <span class="text-red-600">{store.total}</span> VNĐ</h3>

      <table class="w-full">
        <thead>
          <th class="py-2">Bậc thang</th>
          <th class="py-2">Đơn giá (VNĐ/kWh)</th>
          <th class="py-2">Định mức (kWh)</th>
          <th class="py-2">Thành tiền (VNĐ)</th>
        </thead>
        <tbody class="text-center">
          {responseJson.value && responseJson.value.map((d: IData, index: number) => d &&
            <tr key={d.BTHANG_ID}>
              <td class="py-2">{index+1}</td>
              <td class="py-2">{d.DON_GIA}</td>
              <td class="py-2">{d.DINH_MUC > 0 ? d.DINH_MUC : store.numUsed[index] / d.DON_GIA}</td>
              <td class="py-2">{store.numUsed[index]}</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
});
