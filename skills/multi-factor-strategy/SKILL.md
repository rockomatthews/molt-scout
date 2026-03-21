\-\-\-
name: multi-factor-strategy
description: Guide users to create multi-factor stock selection strategies and generate independent YAML configuration files
\-\-\-
{"homepage":"https://gitcode.com/datavoid/quantcli","user-invocable":true}

\# Multi-Factor Strategy Assistant

Guide you to create multi-factor stock selection strategies and generate independent YAML configuration files.

\## Install quantcli

\`\`\`bash
\# Install from PyPI (recommended)
pip install quantcli

\# Or install from source
git clone https://gitcode.com/datavoid/quantcli.git
cd quantcli
pip install -e .
\`\`\`

Verify installation:
\`\`\`bash
quantcli --help
\`\`\`

\## Quick Start

A complete multi-factor stock selection strategy YAML example:

\`\`\`yaml
name: Value-Growth Hybrid Strategy
version: 1.0.0
description: ROE + Momentum factor stock selection

screening:
 fundamental\_conditions: # Stage 1: Financial condition screening
 \- "roe > 0.10" # ROE > 10%
 \- "pe\_ttm < 30" # P/E < 30
 \- "pe\_ttm > 0" # Exclude losses
 daily\_conditions: # Stage 2: Price condition screening
 \- "close > ma10" # Above 10-day MA
 limit: 100 # Keep at most 100 stocks

\# Factor configuration (supports two methods, factors at top level)
factors:
 # Method 1: Inline factor definition
 \- name: ma10\_deviation
 expr: "(close - ma(close, 10)) / ma(close, 10)"
 direction: negative
 description: "10-day MA deviation"

 # Method 2: External reference (reference factor files in factors/ directory, include .yaml suffix)
 \- factors/alpha\_001.yaml
 \- factors/alpha\_008.yaml

ranking:
 weights: # Weight fusion
 ma10\_deviation: 0.20 # Inline factor
 factors/alpha\_001.yaml: 0.40 # External reference factor
 factors/alpha\_008.yaml: 0.40
 normalize: zscore # Normalization method

output:
 limit: 30 # Output top 30 stocks
 columns: \[symbol, name, score, roe, pe\_ttm, close, ma10\_deviation\]
\`\`\`

\### Factor Configuration Methods

\*\*Factor configuration supports two methods (can be mixed):\*\*

\| Method \| Type \| Example \| Description \|
\|--------\|------\|---------\|-------------\|
\| \*\*Inline\*\* \| \`dict\` \| \`{name: xxx, expr: "..."}\` \| Define expression directly in YAML \|
\| \*\*External\*\* \| \`str\` \| \`factors/alpha\_001.yaml\` \| Load factor file from \`factors/\` directory \|

\*\*Example: Mixed usage\*\*

\`\`\`yaml
factors:
 # Inline: Custom factor
 \- name: custom\_momentum
 expr: "close / delay(close, 20) - 1"
 direction: positive

 # External: Alpha101 factor library (include .yaml suffix)
 \- factors/alpha\_001.yaml
 \- factors/alpha\_005.yaml
 \- factors/alpha\_009.yaml

ranking:
 weights:
 custom\_momentum: 0.3
 factors/alpha\_001.yaml: 0.3
 factors/alpha\_005.yaml: 0.2
 factors/alpha\_009.yaml: 0.2
\`\`\`

Run strategy:
\`\`\`bash
quantcli filter run -f your\_strategy.yaml
\`\`\`

\## Invocation

\`\`\`
/multi-factor-strategy
\`\`\`

\## Available Expression Functions

\### Data Processing Functions
\| Function \| Usage \| Description \|
\|----------\|-------\|-------------\|
\| delay \| \`delay(x, n)\` \| Lag n periods \|
\| ma \| \`ma(x, n)\` \| Simple moving average \|
\| ema \| \`ema(x, n)\` \| Exponential moving average \|
\| rolling\_sum \| \`rolling\_sum(x, n)\` \| Rolling sum \|
\| rolling\_std \| \`rolling\_std(x, n)\` \| Rolling standard deviation \|

\### Technical Indicator Functions
\| Function \| Usage \| Description \|
\|----------\|-------\|-------------\|
\| rsi \| \`rsi(x, n=14)\` \| Relative strength index \|
\| correlation \| \`correlation(x, y, n)\` \| Correlation coefficient \|
\| cross\_up \| \`cross\_up(a, b)\` \| Golden cross (a crosses above b) \|
\| cross\_down \| \`cross\_down(a, b)\` \| Death cross (a crosses below b) \|

\### Ranking & Normalization Functions
\| Function \| Usage \| Description \|
\|----------\|-------\|-------------\|
\| rank \| \`rank(x)\` \| Cross-sectional ranking (0-1) \|
\| zscore \| \`zscore(x)\` \| Standardization \|
\| sign \| \`sign(x)\` \| Sign function \|
\| clamp \| \`clamp(x, min, max)\` \| Clipping function \|

\### Conditional Functions
\| Function \| Usage \| Description \|
\|----------\|-------\|-------------\|
\| where \| \`where(cond, t, f)\` \| Conditional selection \|
\| if \| \`if(cond, t, f)\` \| Conditional selection (alias) \|

\### Base Fields
\| Field \| Description \|
\|-------\|-------------\|
\| open, high, low, close \| OHLC prices \|
\| volume \| Trading volume \|
\| pe, pb \| P/E ratio, P/B ratio \|
\| roe \| Return on equity \|
\| netprofitmargin \| Net profit margin \|

\## Guided Workflow

\### Step 1: Strategy Goal定位

I will first understand your strategy needs:
\- \*\*Strategy Type\*\*: Value, Growth, Momentum, Volatility, Hybrid
\- \*\*Selection Count\*\*: Concentrated(10-30), Medium(50-100), Diversified(200+)
\- \*\*Holding Period\*\*: Intraday, Short-term(week), Medium-term(month), Long-term(quarter)

\### Step 2: Factor Selection

Based on your strategy goals, recommend suitable factor combinations:

\*\*Common Fundamental Factors\*\*:
\| Factor \| Expression \| Direction \| Description \|
\|--------\|------------\|-----------\|-------------\|
\| roe \| \`roe\` \| positive \| Return on equity \|
\| pe \| \`pe\` \| negative \| Lower P/E is better \|
\| pb \| \`pb\` \| negative \| Price-to-book ratio \|
\| netprofitmargin \| \`netprofitmargin\` \| positive \| Net profit margin \|
\| revenue\_growth \| \`revenue\_yoy\` \| positive \| Revenue growth rate \|

\*\*Common Technical Factors\*\*:
\| Factor \| Expression \| Direction \| Description \|
\|--------\|------------\|-----------\|-------------\|
\| momentum \| \`(close/delay(close,20))-1\` \| positive \| N-day momentum \|
\| ma\_deviation \| \`(close-ma(close,10))/ma(close,10)\` \| negative \| MA deviation \|
\| ma\_slope \| \`(ma(close,10)-delay(ma(close,10),5))/delay(ma(close,10),5)\` \| positive \| MA slope \|
\| volume\_ratio \| \`volume/ma(volume,5)\` \| negative \| Volume ratio \|

\*\*Alpha101 Built-in Factors\*\* (can reference \`{baseDir}/alpha101/alpha\_XXX\`):

QuantCLI includes 40 WorldQuant Alpha101 factors that can be directly referenced:

\| Factor \| Category \| Description \|
\|--------\|----------\|-------------\|
\| \`alpha101/alpha\_001\` \| Reversal \| 20-day new high then decline \|
\| \`alpha101/alpha\_002\` \| Reversal \| Down volume bottom \|
\| \`alpha101/alpha\_003\` \| Volatility \| Low volatility stability \|
\| \`alpha101/alpha\_004\` \| Capital Flow \| Net capital inflow \|
\| \`alpha101/alpha\_005\` \| Trend \| Uptrend \|
\| \`alpha101/alpha\_008\` \| Capital Flow \| Capital inflow \|
\| \`alpha101/alpha\_009\` \| Momentum \| Long-term momentum \|
\| \`alpha101/alpha\_010\` \| Reversal \| MA deviation reversal \|
\| \`alpha101/alpha\_011\` ~ \`alpha\_020\` \| Extended \| Volatility, momentum, price-volume factors \|
\| \`alpha101/alpha\_021\` ~ \`alpha\_030\` \| Extended \| Price-volume, trend, strength factors \|
\| \`alpha101/alpha\_031\` ~ \`alpha\_040\` \| Extended \| Position, volatility, capital factors \|

\*\*View all built-in factors:\*\*
\`\`\`bash
quantcli factors list
\`\`\`

\*\*Usage Example:\*\*
\`\`\`yaml
factors:
 \- alpha101/alpha\_001 # Reversal factor
 \- alpha101/alpha\_008 # Capital inflow
 \- alpha101/alpha\_029 # 5-day momentum
ranking:
 weights:
 alpha101/alpha\_001: 0.4
 alpha101/alpha\_008: 0.3
 alpha101/alpha\_029: 0.3
\`\`\`

\*\*Screening Conditions Example\*\*:
\`\`\`yaml
screening:
 conditions:
 \- "roe > 0.10" # ROE > 10%
 \- "netprofitmargin > 0.05" # Net profit margin > 5%
\`\`\`

\### Step 3: Weight Configuration

Allocate weights based on factor importance, 0 means only for screening, not scoring:

\`\`\`yaml
ranking:
 weights:
 # Fundamental factors
 roe: 0.30
 pe: 0.20
 # Technical factors
 ma\_deviation: 0.30
 momentum: 0.20
 normalize: zscore
\`\`\`

\### Step 4: Generate Strategy File

I will generate a complete strategy YAML file for you:

\`\`\`yaml
name: Your Strategy Name
version: 1.0.0
description: Strategy description

\# Stage 1: Fundamental screening
screening:
 conditions:
 \- "roe > 0.10"
 \- "pe < 30"
 limit: 200

\# Stage 2: Technical ranking
ranking:
 weights:
 roe: 0.30
 pe: 0.20
 ma\_deviation: 0.30
 momentum: 0.20
 normalize: zscore

output:
 columns: \[symbol, score, rank, roe, pe, momentum\]
 limit: 30
\`\`\`

\### Step 5: Run & Evaluate

\*\*Run strategy\*\*:
\`\`\`bash
quantcli filter run -f your\_strategy.yaml --top 30
\`\`\`

\*\*Evaluation points\*\*:
1\. \*\*Selected stock count\*\*: Check if screening conditions are reasonable
2\. \*\*Factor distribution\*\*: Distribution of factor scores
3\. \*\*Industry diversification\*\*: Avoid over-concentration

\## FAQ

\*\*Q: How to allocate factor weights?\*\*
A: Core factors 0.3-0.4, auxiliary factors 0.1-0.2, ensure weights sum close to 1

\*\*Q: Screening conditions too strict resulting in empty results?\*\*
A: Gradually relax conditions, first see how many stocks meet each condition

\*\*Q: What expression syntax is supported?\*\*
A: Supports 40+ built-in functions: \`ma()\`, \`ema()\`, \`delay()\`, \`rolling\_sum()\`, \`rsi()\`, \`rank()\`, \`zscore()\`, etc.