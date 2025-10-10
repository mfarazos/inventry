import React, { forwardRef } from "react";

type Row = {
  date?: string;
  quality?: string;
  dcNumber?: string;
  grossWeight?: number | string;
  rate?: number | string;
  amount?: number | string;
  totalAmount?: number | string;
  extraRate?: number | string;
  extraAmount?: number | string;
  [k: string]: any;
};

interface WeightData {
  openingBalanceWeightPure?: number;
  openingBalanceWeightMixing?: number;
  purchaseWeightPure?: number;
  purchaseWeightMixing?: number;
  totalPurchaseWeightPure?: number;
  totalPurchaseWeightMixing?: number;
  saleWeightPure?: number;
  saleWeightMixing?: number;
  closingWeightPure?: number;
  closingWeightMixing?: number;
  Purebags?: number;
  Mixingbags?: number;
}

interface BillDetails {
  billNo?: string;
  totalgrossWeight?: number;
  totalAmount?: number;
  totalRate?: number;
  grossWeightCompany?: number;
  rateCompany?: number;
  amountCompany?: number;
}

interface Props {
  userName?: string;
  selectedMonth: string; // "YYYY-MM"
  data: Row[];
  billData?: BillDetails[] | null;
  weightData?: WeightData | null;
  userType?: string;
}

const BillingReport = forwardRef<HTMLDivElement, Props>(
  ({ userName, selectedMonth, data, billData, weightData, userType }, ref) => {
    const billDetails = billData?.[0];

    const fmt = (n: any) =>
      Number(n || 0).toFixed(2);

    // last day of selectedMonth
    const lastDate = new Date(
      new Date(selectedMonth + "-01").getFullYear(),
      new Date(selectedMonth + "-01").getMonth() + 1,
      0
    ).toLocaleDateString("en-GB", { day: "2-digit", month: "numeric", year: "numeric" });

    const hasCompanyData =
      userType !== "walkingCustomer" && billDetails?.grossWeightCompany !== undefined;

    const totalWeight = (billDetails?.totalgrossWeight || 0) + (billDetails?.grossWeightCompany || 0);
    const totalAmount = (billDetails?.totalAmount || 0) + (billDetails?.amountCompany || 0);

    return (
      <div ref={ref}>
        {/* Embedded styles to match PDF look */}
        <style>{`
          @page { size: A4; margin: 20mm; }
          .rep-body { font-family: Arial, sans-serif; color:#333; }
          .rep-container { padding:20px; box-sizing:border-box; }
          .rep-header { display:flex; justify-content:space-between; align-items:baseline; }
          .rep-header h1 { margin:0; font-size:24px; }
          .rep-period { font-size:14px; color:#555; margin:0; }
          .section-heading {
            background: linear-gradient(90deg, #f7f7f7, #e8e8e8);
            padding: 10px 14px; border-radius: 6px; font-weight: bold; font-size: 17px; margin: 18px 0 10px;
          }
          table { width:100%; border-collapse:collapse; margin-top:12px; }
          th, td { border:1px solid #ddd; padding:8px; }
          th { background:#f0f0f0; text-align:center; }
          td.right { text-align:right; }
          .stock-table th { background:#eee; }
          .summary-grid { display:flex; gap:24px; margin-top:10px; }
          .summary-grid > div { min-width:160px; }
          .summary-grid label { display:block; margin-bottom:4px; font-weight:bold; }
          .summary-grid input { width:100%; padding:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; }
          /* Print-friendly */
          @media print {
            .no-print { display:none !important; }
            body { background:#fff; }
          }
        `}</style>

        <div className="rep-body">
          <div className="rep-container">
            <div className="rep-header">
              <h1>
                {userName || "Customer"}
                <br />
                Bill No: {billDetails?.billNo || "-"}
              </h1>
              <h3 className="rep-period">Date: {lastDate}</h3>
            </div>

            {/* Stock purchases must stay on top (as you asked) */}
            {userType !== "walkingCustomer" && weightData && (
              <>
                <div className="section-heading">Stock Purchases Summary (Top)</div>
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Summary</th>
                      <th>Pure</th>
                      <th>Mixing</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Opening balance", weightData?.openingBalanceWeightPure, weightData?.openingBalanceWeightMixing],
                      ["Total dana received by party", weightData?.purchaseWeightPure, weightData?.purchaseWeightMixing],
                      ["Total dana received + opening balance", weightData?.totalPurchaseWeightPure, weightData?.totalPurchaseWeightMixing],
                      ["Total dana consumption", weightData?.saleWeightPure, weightData?.saleWeightMixing],
                      ["Closing Balance", weightData?.closingWeightPure, weightData?.closingWeightMixing],
                      ["Bags", weightData?.Purebags, weightData?.Mixingbags],
                    ].map(([label, pure, mix], i) => (
                      <tr key={i}>
                        <td>{label as string}</td>
                        <td className="right">{fmt(pure)}</td>
                        <td className="right">{fmt(mix)}</td>
                        <td className="right">{fmt((Number(pure) || 0) + (Number(mix) || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Main table (same structure as PDF) */}
            <div className="section-heading">Check Table</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Quality</th><th>DC Number</th>
                  <th>Weight</th><th>Rate</th><th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  <>
                    {data.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: "center" }}>
                          {item.date
                            ? new Date(item.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td style={{ textAlign: "center" }}>{item.quality || "-"}</td>
                        <td style={{ textAlign: "center" }}>{item.dcNumber || "-"}</td>
                        <td className="right">{fmt(item.grossWeight)}</td>
                        <td className="right">{fmt(item.rate)}</td>
                        <td className="right">{fmt(item.amount)}</td>
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}><strong>Total:</strong></td>
                      <td className="right"><strong>{fmt(billDetails?.totalgrossWeight)}</strong></td>
                      <td />
                      <td className="right"><strong>{fmt(billDetails?.totalAmount)}</strong></td>
                    </tr>

                    {/* Company Excess */}
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}><strong>Danaa Excess from Company:</strong></td>
                      <td className="right"><strong>{fmt(billDetails?.grossWeightCompany)}</strong></td>
                      <td className="right"><strong>{fmt(billDetails?.rateCompany)}</strong></td>
                      <td className="right"><strong>{fmt(billDetails?.amountCompany)}</strong></td>
                    </tr>

                    {/* Grand Total */}
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center" }}><strong>Grand Total:</strong></td>
                      <td />
                      <td />
                      <td className="right"><strong>{fmt((billDetails?.totalAmount || 0) + (billDetails?.amountCompany || 0))}</strong></td>
                    </tr>

                    {/* Extra Rate / Amount rows */}
                    {data
                      .filter((x) => x.extraRate || x.extraAmount)
                      .map((x, i) => (
                        <tr key={`extra-${i}`}>
                          <td colSpan={3} style={{ textAlign: "center" }}>
                            <strong>Extra Rate {i + 1}</strong>
                          </td>
                          <td />
                          <td className="right"><strong>{fmt(x.extraRate)}</strong></td>
                          <td className="right"><strong>{fmt(x.extraAmount)}</strong></td>
                        </tr>
                      ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      No data available for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Conditional summary (same as PDF) */}
            {hasCompanyData && (
              <>
                <div className="section-heading">After Adding Company Rate and Weight</div>
                <div className="summary-grid">
                  <div>
                    <label>Total Weight</label>
                    <input value={fmt(totalWeight)} readOnly />
                  </div>
                  <div>
                    <label>Total Amount</label>
                    <input value={fmt(totalAmount)} readOnly />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default BillingReport;
