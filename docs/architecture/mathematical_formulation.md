# Mathematical Optimization Formulation
## Green Fleet Deployment and Speed-Fuel Optimization

### 1. Sets and Indices
- $V$: Set of available vessel candidates, indexed by $v \in \{1, \dots, \lvert V vert\}$.
- $R$: Set of maritime shipping corridors / routes, indexed by $r \in \{1, \dots, \lvert R vert\}$.
- $F$: Set of marine fuel pathways, indexed by $f \in \{	ext{VLSFO}, 	ext{MGO}, 	ext{LNG}, 	ext{BIO\_METHANOL}, 	ext{GREEN\_H2}, 	ext{GREEN\_NH3}, 	ext{SHORE\_POWER}\}$.
- $S$: Discretized cruising speed options (knots), $v_s \in [v_{\min}, v_{\max}]$.

---

### 2. Parameters
- $D_r$: Total cargo demand on corridor $r$ (TEU or Metric Tons) over the planning horizon.
- $L_r$: One-way nautical distance of corridor $r$ (nautical miles, NM).
- $T_{\max, r}$: Maximum allowable voyage duration window on corridor $r$ (days).
- $T_{	ext{berth}, r}$: Port berth dwelling and cargo handling duration (days).
- $C_v$: Nominal cargo payload capacity of vessel $v$ (TEU or DWT).
- $E_{v, f} \in \{0, 1\}$: Binary compatibility indicator between vessel $v$ and fuel type $f$.
- $P_{	ext{aux}, v}$: Auxiliary electrical power requirement at berth (MW).
- $	ext{LHV}_f$: Lower Heating Value of fuel $f$ (MJ/kg).
- $	ext{EF}_{	ext{WTT}, f}$: Upstream Well-to-Tank emission factor ($g	ext{CO}_2	ext{e}/	ext{MJ}$).
- $	ext{EF}_{	ext{TTW}, f}$: Combustion Tank-to-Wake emission factor ($g	ext{CO}_2/	ext{g fuel}$).
- $C_{	ext{fuel}, f}$: Unit bunkering cost of fuel $f$ (\$ / Metric Ton).
- $C_{	ext{hire}, v}$: Daily charter / capital fixed cost of vessel $v$ (\$ / day).
- $C_{	ext{tax}}$: Carbon tax levy (\$ / ton $	ext{CO}_2	ext{e}$ WTW).
- $	ext{CI}_{	ext{grid}, r}$: Carbon intensity of local port shore electrical grid ($g	ext{CO}_2	ext{e}/	ext{kWh}$).
- $A_{	ext{shore}, r} \in \{0, 1\}$: Shore power availability at destination ports of corridor $r$.

---

### 3. Decision Variables
- $x_{v, r, f} \in \{0, 1\}$: Binary decision indicating vessel $v$ is deployed on route $r$ using fuel $f$.
- $v_{s, v, r} \in [v_{\min, v}, v_{\max, v}]$: Operating cruising speed of vessel $v$ on corridor $r$ (knots).
- $k_{v, r} \in \mathbb{Z}_{\ge 0}$: Number of round trips performed by vessel $v$ on corridor $r$.
- $u_{	ext{shore}, v, r} \in \{0, 1\}$: Binary indicator of cold-ironing shore power connection at berth.

---

### 4. Objective Functions

The problem is formulated as a tri-objective optimization problem:
$$\min_{\mathbf{x}} \mathbf{F}(\mathbf{x}) = \Big( f_1(\mathbf{x}), f_2(\mathbf{x}), f_3(\mathbf{x}) \Big)$$

#### Objective 1: Total Fuel Consumption ($f_1$ in Metric Tons of Fuel Oil Equivalent, MTOE)
$$f_1(\mathbf{x}) = \sum_{v \in V} \sum_{r \in R} \sum_{f \in F} x_{v, r, f} \cdot k_{v, r} \cdot \left[ 	ext{FC}_{	ext{sea}}(v, v_{s, v, r}, r) \cdot rac{L_r}{24 \cdot v_{s, v, r}} \cdot rac{	ext{LHV}_{	ext{VLSFO}}}{	ext{LHV}_f} + 	ext{FC}_{	ext{berth}}(v, f, u_{	ext{shore}, v, r}) \cdot T_{	ext{berth}, r} ight]$$

#### Objective 2: Total Operating Cost ($f_2$ in \$ USD)
$$f_2(\mathbf{x}) = \sum_{v, r, f} x_{v, r, f} \cdot k_{v, r} \cdot \Big[ C_{	ext{hire}, v} \cdot T_{	ext{voyage}}(v_{s}, r) + C_{	ext{bunker}}(v, r, f, v_s) + C_{	ext{shore}}(u_{	ext{shore}}) + C_{	ext{tax}} \cdot 	ext{GHG}_{	ext{voyage}}(v, r, f) \Big]$$

#### Objective 3: Total Lifecycle Greenhouse Gas Emissions ($f_3$ in $t	ext{CO}_2	ext{e}$ Well-to-Wake)
$$f_3(\mathbf{x}) = \sum_{v, r, f} x_{v, r, f} \cdot k_{v, r} \cdot \Big[ 	ext{GHG}_{	ext{WTT}}(v, r, f) + 	ext{GHG}_{	ext{TTW}}(v, r, f) + 	ext{GHG}_{	ext{berth}}(v, r, u_{	ext{shore}}) \Big]$$
Where:
- $	ext{GHG}_{	ext{WTT}} = M_{	ext{fuel}} \cdot 	ext{LHV}_f \cdot 	ext{EF}_{	ext{WTT}, f} 	imes 10^{-6}$
- $	ext{GHG}_{	ext{TTW}} = M_{	ext{fuel}} \cdot 	ext{EF}_{	ext{TTW}, f}$
- $	ext{GHG}_{	ext{berth}} = (1 - u_{	ext{shore}}) \cdot M_{	ext{aux\_fuel}} \cdot 	ext{EF}_{	ext{TTW, MGO}} + u_{	ext{shore}} \cdot (P_{	ext{aux}, v} \cdot 24 \cdot T_{	ext{berth}} \cdot 1000) \cdot 	ext{CI}_{	ext{grid}, r} 	imes 10^{-6}$

---

### 5. Constraints and Operational Feasibility

1. **Cargo Demand Satisfaction (Zero Shortfall)**:
   $$\sum_{v \in V} \sum_{f \in F} x_{v, r, f} \cdot k_{v, r} \cdot C_v \ge D_r \quad orall r \in R$$

2. **Vessel Fleet Inventory Constraint**:
   $$\sum_{r \in R} \sum_{f \in F} x_{v, r, f} \le 1 \quad orall v \in V$$
   *(Each vessel in the fleet can be deployed on at most one corridor during the scheduling window)*.

3. **Vessel-Fuel Compatibility**:
   $$x_{v, r, f} \le E_{v, f} \quad orall v \in V, r \in R, f \in F$$

4. **Schedule Reliability & Transit Time Windows**:
   $$T_{	ext{transit}}(v_{s, v, r}, r) + T_{	ext{berth}, r} \le T_{\max, r} \quad orall v, r 	ext{ where } \sum_f x_{v,r,f} = 1$$
   where $T_{	ext{transit}} = rac{L_r}{24 \cdot v_{s, v, r}}$.

5. **Shore Power Compatibility**:
   $$u_{	ext{shore}, v, r} \le A_{	ext{shore}, r} \cdot E_{v, 	ext{SHORE\_POWER}} \quad orall v \in V, r \in R$$

6. **Corridor Carbon Intensity / Emission Cap**:
   $$rac{f_3(\mathbf{x})}{\sum_r D_r \cdot L_r} \le 	ext{CII}_{	ext{threshold}}$$

---

### 6. Constraint Handling and Repair Strategy
When stochastic quantum operators produce an infeasible individual $\mathbf{x}$:
1. **Demand Shortfall Repair**: Compute shortfall $\Delta D_r = \max(0, D_r - 	ext{allocated}_r)$. Dynamically increase trip counts $k_{v, r}$ or activate unassigned compatible vessels in order of lowest fuel consumption.
2. **Speed Feasibility Clamping**: If voyage time exceeds $T_{\max, r}$, solve for minimum required speed $v_s^* = rac{L_r}{24(T_{\max, r} - T_{	ext{berth}, r})}$. If $v_s^* \le v_{\max, v}$, clamp $v_s = v_s^*$; otherwise apply quadratic penalty to all objectives.
3. **Engine Incompatibility Repair**: Map incompatible fuel choices to the nearest compatible compliant fuel (e.g. if vessel has only conventional engine, force fuel to VLSFO or MGO).
