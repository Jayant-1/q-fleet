# Quantum-Inspired Optimization and Prediction Algorithms
## Theoretical Foundation, Quantum Mechanics Analogs, and Update Operators

### 1. Quantum Principles in Classical Computation
Quantum-inspired metaheuristics do not execute on physical cryogenic quantum hardware (QPU), but mathematically emulate quantum mechanical principles—**superposition, quantum rotation gates, probability amplitudes, and quantum state collapse**—on classical Von Neumann hardware. This yields global search breadth, prevents premature convergence, and optimizes multi-modal combinatorial spaces efficiently.

---

### 2. Quantum-Inspired Feature Selection (QIEA-FS)

#### Mathematical Representation
A chromosome of $M$ features is represented as an array of quantum bits (Q-bits):
$$\mathbf{q} = egin{bmatrix} lpha_1 & lpha_2 & \dots & lpha_M \ eta_1 & eta_2 & \dots & eta_M \end{bmatrix}$$
where $(lpha_i, eta_i) \in \mathbb{C}$ (or $\mathbb{R}$) satisfy the normalization condition:
$$|lpha_i|^2 + |eta_i|^2 = 1 \quad orall i \in \{1, \dots, M\}$$
$|eta_i|^2$ represents the probability that feature $i$ is selected ($x_i = 1$), while $|lpha_i|^2$ is the probability that feature $i$ is omitted ($x_i = 0$).

#### Observation / Superposition Collapse
In each generation, binary candidate solutions $\mathbf{x} \in \{0, 1\}^M$ are observed by sampling against uniform random numbers $r_i \sim \mathcal{U}(0, 1)$:
$$x_i = egin{cases} 1 & 	ext{if } r_i < |eta_i|^2 \ 0 & 	ext{otherwise} \end{cases}$$

#### Quantum Rotation Gate Update
Q-bits are updated using quantum rotation gates:
$$egin{bmatrix} lpha_i^{(t+1)} \ eta_i^{(t+1)} \end{bmatrix} = egin{bmatrix} \cos(\Delta 	heta_i) & -\sin(\Delta 	heta_i) \ \sin(\Delta 	heta_i) & \cos(\Delta 	heta_i) \end{bmatrix} egin{bmatrix} lpha_i^{(t)} \ eta_i^{(t)} \end{bmatrix}$$
The rotation angle $\Delta 	heta_i = s(lpha_i, eta_i) \cdot 	heta_0$ is looked up based on comparing the current candidate feature state $x_i$ against the best-known individual $b_i$:

| $x_i$ | $b_i$ | $f(\mathbf{x}) \ge f(\mathbf{b})$ | $\Delta 	heta_i$ | Rationale |
|---|---|---|---|---|
| 0 | 0 | False | 0 | States match; retain probability |
| 0 | 1 | False | $+0.05\pi$ | Rotate toward selection ($b_i=1$) |
| 1 | 0 | False | $-0.05\pi$ | Rotate toward exclusion ($b_i=0$) |
| 1 | 1 | False | 0 | States match; retain probability |
| * | * | True | 0 | Current is equal or better; no adjustment |

---

### 3. Multi-Objective Quantum-Inspired Evolutionary Algorithm (MO-QIEA)

#### Multi-State Q-bit Fleet Encoding
For the fleet deployment problem, each vessel candidate $v$ on corridor $r$ has decisions:
1. Deployment status $x_{v} \in \{0, 1\}$: encoded by Q-bit $(lpha_{	ext{dep}}, eta_{	ext{dep}})$.
2. Fuel Selection $f \in \{1, \dots, \lvert F vert\}$: encoded by a multi-state Q-qudit or binary register of $\lceil \log_2 \lvert F vert ceil$ Q-bits.
3. Cruising Speed $v_s \in [v_{\min}, v_{\max}]$: encoded by mapping phase angle $	heta_{	ext{speed}} \in [0, \pi/2]$:
   $$v_s = v_{\min} + (v_{\max} - v_{\min}) \cdot \sin^2(	heta_{	ext{speed}})$$

#### Quantum Catastrophe / Mutation Gate
To prevent premature convergence on deceptive local Pareto fronts, when population diversity drops below threshold $\sigma_{	ext{div}} < 0.05$, a Quantum Catastrophe operator resets non-elite Q-bits toward equal superposition:
$$lpha_i \leftarrow rac{1}{\sqrt{2}}, \quad eta_i \leftarrow rac{1}{\sqrt{2}}$$

#### Pareto Non-Dominated Sorting and Crowding Distance
Given population $\mathcal{P}$, candidate $\mathbf{x}_A$ dominates $\mathbf{x}_B$ ($\mathbf{x}_A \prec \mathbf{x}_B$) iff:
$$orall j \in \{1, 2, 3\}, f_j(\mathbf{x}_A) \le f_j(\mathbf{x}_B) \quad 	ext{and} \quad \exists j, f_j(\mathbf{x}_A) < f_j(\mathbf{x}_B)$$
All non-dominated individuals form Front 1 ($\mathcal{F}_1$). Subsequent fronts are ranked iteratively. Diversity along the Pareto boundary is maintained by calculating the Manhattan crowding distance in normalized objective space:
$$d_k = \sum_{j=1}^3 rac{f_j(k+1) - f_j(k-1)}{f_j^{\max} - f_j^{\min}}$$

---

### 4. Algorithmic Complexity and Budgets
- **MO-QIEA Time Complexity**: $\mathcal{O}(G \cdot (N \cdot 	ext{Repair} + M \cdot N^2))$ per run where $G=50$ generations, $N=40$ population size, $M=3$ objectives.
- **Matched Budget Execution**: Exactly 2,000 function evaluations across MO-QIEA, NSGA-II, and MO-PSO ensuring fair statistical comparison.
