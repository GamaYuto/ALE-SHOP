
// 9. Gestión de Pedidos

const loadOrders = async () => {
  orders = await ordersService.getOrders();
  renderOrdersTable();
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { label: 'Pendiente', color: '#fbbf24', bg: '#fef3c7' },
    processing: { label: 'En Proceso', color: '#3b82f6', bg: '#dbeafe' },
    shipped: { label: 'Enviado', color: '#8b5cf6', bg: '#ede9fe' },
    delivered: { label: 'Entregado', color: '#10b981', bg: '#d1fae5' },
    cancelled: { label: 'Cancelado', color: '#ef4444', bg: '#fee2e2' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  return `<span style="background: ${config.bg}; color: ${config.color}; padding: 0.3rem 0.8rem; border-radius: 99px; font-size: 0.85rem; font-weight: 600;">${config.label}</span>`;
};

const renderOrdersTable = () => {
  const filteredOrders = currentStatusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === currentStatusFilter);

  if (filteredOrders.length === 0) {
    ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No hay pedidos para mostrar.</td></tr>';
    return;
  }

  ordersTableBody.innerHTML = filteredOrders.map(order => `
    <tr>
      <td><strong>#${order.id.substring(0, 8)}</strong></td>
      <td>
        <div><strong>${order.customer.name}</strong></div>
        <small style="color: gray;">${order.customer.phone}</small>
      </td>
      <td>
        <div>${order.itemCount} producto${order.itemCount > 1 ? 's' : ''}</div>
        <small style="color: gray;">${order.items.map(i => i.name).join(', ').substring(0, 30)}...</small>
      </td>
      <td><strong>${formatCurrency(order.total)}</strong></td>
      <td>${getStatusBadge(order.status)}</td>
      <td><small>${formatDate(order.createdAt)}</small></td>
      <td>
        <select class="status-select" data-order-id="${order.id}" style="padding: 0.4rem; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En Proceso</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregado</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
        </select>
        <button class="btn-delete-order" data-id="${order.id}" style="margin-left: 0.5rem; color:red; cursor:pointer; background:none; border:none;">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Eventos para cambiar estado
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const orderId = e.target.dataset.orderId;
      const newStatus = e.target.value;
      
      try {
        await ordersService.updateOrderStatus(orderId, newStatus);
        await loadOrders();
        alert('Estado actualizado correctamente ✅');
      } catch (error) {
        alert('Error al actualizar el estado ❌');
      }
    });
  });

  // Eventos para eliminar
  document.querySelectorAll('.btn-delete-order').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.closest('.btn-delete-order').dataset.id;
      if (confirm('¿Estás seguro de eliminar este pedido?')) {
        try {
          await ordersService.deleteOrder(id);
          await loadOrders();
        } catch (error) {
          alert('Error al eliminar el pedido ❌');
        }
      }
    });
  });
};

// Filtros de estado
document.querySelectorAll('.filter-status').forEach(btn => {
  btn.addEventListener('click', (e) => {
    currentStatusFilter = e.target.dataset.status;
    
    // Actualizar estilos de botones
    document.querySelectorAll('.filter-status').forEach(b => {
      b.style.background = 'white';
      b.style.color = 'var(--dark)';
      b.classList.remove('active');
    });
    e.target.style.background = 'var(--primary)';
    e.target.style.color = 'white';
    e.target.classList.add('active');
    
    renderOrdersTable();
  });
});

// Actualizar loadData para incluir pedidos
const originalLoadData = loadData;
const loadData = async () => {
  await loadOrders();
  await loadCategories();
  await loadProducts();
};
