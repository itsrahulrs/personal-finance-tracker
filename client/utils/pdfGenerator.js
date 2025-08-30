import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const generateReportPdf = async (reportData) => {
  if (!reportData || !reportData.transactions) {
    Alert.alert("Error", "No report data available to export.");
    return;
  }

  const transactionsHtml = reportData.transactions
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="color: ${item.type === "income" ? "green" : "red"};">
            ${item.type.toUpperCase()}
          </td>
          <td>₹${parseFloat(item.amount).toLocaleString("en-IN")}</td>
          <td>${new Date(item.transaction_date).toLocaleDateString()}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <html>
      <body>
        <h1>Financial Report</h1>
        <p>${reportData.start_date} → ${reportData.end_date}</p>
        <table border="1" style="width:100%;border-collapse:collapse;">
          <tr><th>Name</th><th>Type</th><th>Amount</th><th>Date</th></tr>
          ${transactionsHtml}
        </table>
      </body>
    </html>
  `;

  try {
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });

    // Share it
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert("PDF saved", `PDF saved to: ${uri}`);
    }
  } catch (error) {
    console.error("PDF export error:", error);
    Alert.alert("Error", "Failed to export PDF.");
  }
};


export { generateReportPdf };