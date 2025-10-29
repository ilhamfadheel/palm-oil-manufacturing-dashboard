# Palm Oil Manufacturing Dashboard - Design Specification

This document contains the detailed design specifications, business model, and technical architecture for the Palm Oil Manufacturing Optimization Dashboard PoC.

## Table of Contents
- [Business Model Canvas](#business-model-canvas)
- [Domain-Driven Design Architecture](#domain-driven-design-architecture)
- [Database Schema](#database-schema)
- [AI Agent Architecture](#ai-agent-architecture)

For implementation instructions, see the main [README.md](../README.md) in the root directory.

---

## Business Model Canvas

### Key Partners
- Palm tree farm operators
- Logistics providers (transportation)
- Warehouse/inventory managers
- Refinery operators
- Field sales representatives
- End clients (B2B buyers)

### Value Propositions
- Reduce excess supply by 20-40% through predictive analytics
- Optimize logistics costs by matching supply with actual demand
- Minimize waste in refinery output
- Improve fulfillment rates by aligning production with work orders
- Real-time visibility across the entire supply chain

### Customer Segments
- Manufacturing operations managers
- Supply chain directors
- Logistics coordinators
- Sales/field representatives
- C-level executives

---

## Domain-Driven Design Architecture

### Bounded Contexts

1. **Farm Management Context**
   - Track farm locations and capacity
   - Monitor harvest schedules
   - Record actual fruit output

2. **Logistics Context**
   - Manage transportation from farm to warehouse
   - Optimize routes based on demand forecasts
   - Track fuel consumption

3. **Inventory & Warehouse Context**
   - Receive and store palm fruits
   - Track inventory levels in real-time
   - Manage storage capacity

4. **Refinery Context**
   - Process palm fruits into palm oil
   - Track production output
   - Monitor refinery capacity

5. **Sales & Work Order Context**
   - Manage client relationships
   - Record work orders from field reps
   - Track order fulfillment status

6. **Analytics & Forecasting Context**
   - Generate demand forecasts using AI
   - Identify excess at each stage
   - Provide optimization recommendations

---

## Database Schema

You can access the schema after running supabase locally on url below:

http://localhost:54323/project/default/database/schemas

- Farms, Harvests, and Harvest Forecasts
- Vehicles, Shipments, and Logistics Optimization
- Warehouses, Inventory Transactions, and Forecasts
- Refineries, Production Batches, and Forecasts
- Clients, Field Representatives, Work Orders, and Demand Forecasts
- Analytics tables for AI/ML operations

---

## AI Agent Architecture

### Planned Agent Roles
1. Supply Forecasting Agent
2. Demand Prediction Agent
3. Logistics Optimization Agent
4. Production Planning Agent
5. Excess Detection Agent
6. Computer Vision Agent (YOLO)
7. Orchestrator Agent

*Note: This is a PoC. Full AI integration is planned for future phases.*
