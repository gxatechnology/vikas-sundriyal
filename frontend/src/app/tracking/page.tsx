const handleTrack = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!shipmentNumber.trim()) return;

  setLoading(true);
  setError("");
  setShipment(null);

  try {
    // Search shipment by shipment number
    const res = await api.get("/shipments", {
      params: {
        search: shipmentNumber,
      },
    });

    const list = res.data.shipments;

    if (list && list.length > 0) {
      // Fetch complete shipment details
      const detailRes = await api.get(`/shipments/${list[0].id}`);
      setShipment(detailRes.data.shipment);
    } else {
      setError("No shipment found with this tracking number.");
    }
  } catch (err) {
    console.error(err);
    setError("Error fetching tracking details. Please try again.");
  } finally {
    setLoading(false);
  }
};