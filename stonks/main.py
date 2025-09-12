from flask import Flask, render_template, request, make_response
import os
import json
import datetime
import yfinance as yf
import requests
import sqlite3
import uuid

# Try to import dotenv for environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)

# Configuration
API_KEYS = {
    "financial_modeling": os.environ.get(
        "FINANCIAL_MODELING_API_KEY", "PKD23o6iRK1epNCc2Ox4xmpbemXSLlGc"
    ),
    "news": os.environ.get("NEWS_API_KEY", "6562b4e030fb433b81c639c515ec7f64"),
}

DATABASE_PATH = 'main.db'


# Utility functions
def get_db_connection():
    """Create a database connection with row factory."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def load_macro_data():
    """Load macroeconomic data from JSON file."""
    try:
        with open('macro_data.json', 'r') as f:
            return json.loads(f.read())
    except Exception as e:
        app.logger.error(f"Error loading macro data: {e}")
        return {}


# Load macro data once at startup
macro_data = load_macro_data()


# API Routes
macro_data = load_macro_data()


# API Routes
@app.route("/top-movers", methods=["GET"])
def top_movers():
    """Get the top gaining and losing stocks."""
    try:
        api_key = API_KEYS['financial_modeling']
        if not api_key:
            return {"error": "API key not configured"}, 500

        # Fetch gainers
        gainers_url = f"https://financialmodelingprep.com/stable/biggest-gainers?apikey={api_key}"
        gainers_response = requests.get(gainers_url)
        gainers_response.raise_for_status()
        gainers_data = gainers_response.json()[:15]

        # Fetch losers
        losers_url = f"https://financialmodelingprep.com/stable/biggest-losers?apikey={api_key}"
        losers_response = requests.get(losers_url)
        losers_response.raise_for_status()
        losers_data = losers_response.json()[:15]

        # Format data
        gainers = [
            [item["symbol"], item["name"], item["changesPercentage"], item["exchange"]]
            for item in gainers_data
        ]

        losers = [
            [item["symbol"], item["name"], item["changesPercentage"], item["exchange"]]
            for item in losers_data
        ]

        return {"gainers": gainers, "losers": losers}

    except requests.RequestException as e:
        app.logger.error(f"API request failed: {e}")
        return {"error": "Failed to fetch market data"}, 500
    except Exception as e:
        app.logger.error(f"Unexpected error in top_movers: {e}")
        return {"error": "An unexpected error occurred"}, 500


@app.route("/news-fetch", methods=["POST", "GET"])
def news_fetch():
    """Fetch news articles based on keyword and date range."""
    try:
        api_key = API_KEYS['news']
        if not api_key:
            return {"error": "News API key not configured"}, 500

        # Get parameters with defaults
        keyword = request.args.get("keyword", "finance")
        from_date = request.args.get(
            "from",
            (datetime.datetime.now() - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
        )
        to_date = request.args.get("to", datetime.datetime.now().strftime("%Y-%m-%d"))        # Build API URL
        url = (f"https://newsapi.org/v2/everything?q={keyword}&from={from_date}"
               f"&to={to_date}&sortBy=popularity&apiKey={api_key}")

        # Make request
        response = requests.get(url)
        response.raise_for_status()
        result = response.json()

        # Extract articles
        articles = result.get("articles", [])
        return {"news": articles}, 200

    except requests.RequestException as e:
        app.logger.error(f"News API request failed: {e}")
        return {"error": "Failed to fetch news data"}, 500
    except Exception as e:
        app.logger.error(f"Unexpected error in news_fetch: {e}")
        return {"error": "An unexpected error occurred"}, 500


@app.route("/country_data", methods=["GET", "POST"])
def country_data_renderer():
    """Format and return macroeconomic data for a given country."""
    try:
        country = request.args.get("country")
        if not country:
            return {"error": "Country parameter is required"}, 400

        country = country.strip()
        if country not in macro_data:
            return {"error": f"Data not available for country: {country}"}, 404

        data_country = macro_data[country]
        years = sorted(data_country.keys(), reverse=True)

        formatted_data = {
            "gdp": {
                "labels": years,
                "values": [data_country[year]["gdp"] for year in years],
                "unit": "Million USD",
            },
            "per_capita_gdp": {
                "labels": years,
                "values": [data_country[year]["gdp_per_capita"] for year in years],
                "unit": "USD",
            },
            "inflation": {
                "labels": years,
                "values": [data_country[year]["inflation"] for year in years],
                "unit": "Percent",
            },
            "unemployment": {
                "labels": years,
                "values": [data_country[year]["unemployment"] for year in years],
                "unit": "Percent",
            },
        }

        return formatted_data, 200

    except KeyError as e:
        country_name = request.args.get("country", "unknown")
        app.logger.error(f"Missing data key for country {country_name}: {e}")
        return {"error": "Incomplete data for requested country"}, 404
    except Exception as e:
        app.logger.error(f"Error processing country data: {e}")
        return {"error": "Failed to process country data"}, 500


@app.route("/lesson-progress-update", methods=["POST", "GET"])
def lesson_progress():
    """Update user's lesson progress and contributions."""
    try:
        userid = request.cookies.get("userid")
        if not userid:
            return {"error": "User ID not found in cookies"}, 400

        chapter_number = request.args.get("chapter")
        if not chapter_number or not chapter_number.isdigit():
            return {"error": "Valid chapter number is required"}, 400

        chapter_num = int(chapter_number)
        if chapter_num < 1 or chapter_num > 8:
            return {"error": "Chapter number must be between 1 and 8"}, 400

        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Get current progress
            query = f"SELECT chapter{chapter_number}, percentage_complete, contributions FROM main WHERE userid = ?"
            cursor.execute(query, (userid,))
            row = cursor.fetchone()

            if not row:
                return {"error": "User not found"}, 404

            current_chapter_value = row[0]
            current_percentage = row[1]
            contributions_json = row[2]

            # Update progress
            new_chapter_value = current_chapter_value + 1
            new_percentage = current_percentage + 1

            # Update contributions
            try:
                contributions = json.loads(contributions_json) if contributions_json else {}
            except json.JSONDecodeError:
                contributions = {}

            today = datetime.datetime.now().strftime("%Y-%m-%d")
            contributions[today] = contributions.get(today, 0) + 1

            # Save updates
            update_query = (f"UPDATE main SET chapter{chapter_number} = ?, "
                          f"percentage_complete = ?, contributions = ? WHERE userid = ?")
            cursor.execute(update_query,
                         (new_chapter_value, new_percentage, json.dumps(contributions), userid))
            conn.commit()

            return {"message": "Progress updated successfully", "new_value": new_chapter_value}, 200

    except Exception as e:
        app.logger.error(f"Error updating lesson progress: {e}")
        return {"error": "Failed to update lesson progress"}, 500


@app.route("/display-contributions", methods=["GET"])
def display_contributions():
    """Get user's contribution history."""
    try:
        userid = request.cookies.get("userid")
        if not userid:
            return {"error": "User ID not found in cookies"}, 400

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT contributions FROM main WHERE userid = ?", (userid,))
            row = cursor.fetchone()

            if not row:
                return {"error": "User not found"}, 404

            contributions = row[0] if row[0] else "{}"
            return contributions

    except Exception as e:
        app.logger.error(f"Error retrieving contributions: {e}")
        return {"error": "Failed to retrieve contribution data"}, 500


@app.route("/get-lesson-progress", methods=["GET"])
def get_lesson_progress():
    """Get user's progress across all lessons."""
    try:
        userid = request.cookies.get("userid")
        if not userid:
            return {"error": "User ID not found in cookies"}, 400

        with get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT chapter1, chapter2, chapter3, chapter4, chapter5,
                       chapter6, chapter7, chapter8, percentage_complete
                FROM main WHERE userid = ?
            """
            cursor.execute(query, (userid,))
            row = cursor.fetchone()

            if not row:
                return {"error": "User not found"}, 404

            progress = {
                "chapter1": row[0],
                "chapter2": row[1],
                "chapter3": row[2],
                "chapter4": row[3],
                "chapter5": row[4],
                "chapter6": row[5],
                "chapter7": row[6],
                "chapter8": row[7],
                "percentage_complete": row[8],
            }

            return progress

    except Exception as e:
        app.logger.error(f"Error retrieving lesson progress: {e}")
        return {"error": "Failed to retrieve lesson progress"}, 500


@app.route("/learn-user-create", methods=["POST", "GET"])
def create_user_learn():
    """Create a new user for the learning platform."""
    try:
        # Check if user already exists
        userid = request.cookies.get("userid")
        if userid:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT userid FROM main WHERE userid = ?", (userid,))
                if cursor.fetchone():
                    return {"message": "User already exists"}, 200

        # Create new user
        new_userid = str(uuid.uuid4())
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = """
                INSERT INTO main (
                    userid, chapter1, chapter2, chapter3, chapter4,
                    chapter5, chapter6, chapter7, chapter8,
                    contributions, percentage_complete
                ) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, '{}', 0)
            """
            cursor.execute(query, (new_userid,))
            conn.commit()

        # Set cookie
        response = make_response({"message": "User created successfully", "userid": new_userid})
        response.set_cookie("userid", new_userid)
        return response, 200

    except Exception as e:
        app.logger.error(f"Error creating user: {e}")
        return {"error": "Failed to create user"}, 500


# Page Routes
@app.route("/macroeconomic", methods=["GET"])
def worldmap_page():
    """Render the macroeconomic data visualization page."""
    return render_template("macroeconomic.html")


@app.route("/news", methods=["GET"])
def news():
    """Render the news page."""
    return render_template("news.html")


@app.route("/learn", methods=["GET"])
def learn():
    return render_template("stonks_learn.html")


@app.route("/invest", methods=["GET"])
def invest():
    return render_template("stonks_invest.html")


@app.route("/movers", methods=["GET"])
def movers():
    return render_template("movers.html")


@app.route("/learn/lesson1", methods=["GET"])
def lesson1():
    return render_template("lesson1.html")


@app.route("/", methods=["GET"])
def home():
    return render_template("stonks.html")


@app.route("/module1lesson1", methods=["GET"])
def module1lesson1():
    return render_template("module1lesson1.html")


@app.route("/module1lesson2", methods=["GET"])
def module1lesson2():
    return render_template("module1lesson2.html")


@app.route("/module1lesson3", methods=["GET"])
def module1lesson3():
    return render_template("module1lesson3.html")


@app.route("/module2lesson1", methods=["GET"])
def module2lesson1():
    return render_template("module2lesson1.html")


@app.route("/module2lesson2", methods=["GET"])
def module2lesson2():
    return render_template("module2lesson2.html")


@app.route("/module2lesson3", methods=["GET"])
def module2lesson3():
    return render_template("module2lesson3.html")


@app.route("/analyze", methods=["GET"])
def analyze():
    return render_template("analysis.html")


@app.route("/analysis_data", methods=["GET"])
def analysis_data():
    """Retrieve and format stock analysis data."""
    try:
        ticker = request.args.get("ticker")
        if not ticker:
            return {"error": "Ticker symbol is required"}, 400

        stock = yf.Ticker(ticker)

        # Get basic company info
        info = stock.info
        company_name = info.get("longName", "N/A")
        ceo_name = (
            info.get("companyOfficers", [{}])[0].get("name", "N/A")
            if info.get("companyOfficers")
            else "N/A"
        )
        market_cap = info.get("marketCap", "N/A")
        founded_date = info.get("foundedYear", "N/A")

        # Get financial data
        financials = stock.financials
        balance_sheet = stock.balance_sheet
        cashflow = stock.cashflow

        # Get annual ratios for last 4 years
        annual_ratios = {}
        if not financials.empty and not balance_sheet.empty:
            years = financials.columns[:4]  # Last 4 years

            for year in years:
                year_str = str(year.year)
                annual_ratios[year_str] = {}

                # Calculate P/E (Price to Earnings)
                if "Net Income" in financials.index and year in financials.columns:
                    net_income = financials.loc["Net Income", year]
                    shares_outstanding = info.get("sharesOutstanding", 1)
                    eps = net_income / shares_outstanding if shares_outstanding else 0
                    pe_ratio = info.get("currentPrice", 0) / eps if eps != 0 else "N/A"
                    annual_ratios[year_str]["PE"] = pe_ratio
                else:
                    annual_ratios[year_str]["PE"] = "N/A"

                # Calculate P/S (Price to Sales)
                if "Total Revenue" in financials.index and year in financials.columns:
                    revenue = financials.loc["Total Revenue", year]
                    shares_outstanding = info.get("sharesOutstanding", 1)
                    revenue_per_share = (
                        revenue / shares_outstanding if shares_outstanding else 0
                    )
                    ps_ratio = (
                        info.get("currentPrice", 0) / revenue_per_share
                        if revenue_per_share != 0
                        else "N/A"
                    )
                    annual_ratios[year_str]["PS"] = ps_ratio
                else:
                    annual_ratios[year_str]["PS"] = "N/A"

                # EV/EBITDA calculation (simplified)
                annual_ratios[year_str]["EV_EBITDA"] = info.get("enterpriseToEbitda", "N/A")

        # Get current financial metrics
        current_metrics = {
            "Total_Cash": (
                balance_sheet.loc["Cash And Cash Equivalents", balance_sheet.columns[0]]
                if ("Cash And Cash Equivalents" in balance_sheet.index
                    and not balance_sheet.empty)
                else "N/A"
            ),
            "Total_Cash_Per_Share": info.get("totalCashPerShare", "N/A"),
            "Revenue": (
                financials.loc["Total Revenue", financials.columns[0]]
                if "Total Revenue" in financials.index and not financials.empty
                else "N/A"
            ),
            "Gross_Profit": (
                financials.loc["Gross Profit", financials.columns[0]]
                if "Gross Profit" in financials.index and not financials.empty
                else "N/A"
            ),
            "Total_Debt": (
                balance_sheet.loc["Total Debt", balance_sheet.columns[0]]
                if "Total Debt" in balance_sheet.index and not balance_sheet.empty
                else "N/A"
            ),
            "Total_Debt_to_Equity": info.get("debtToEquity", "N/A"),
            "Operating_Cash_Flow": (
                cashflow.loc["Operating Cash Flow", cashflow.columns[0]]
                if "Operating Cash Flow" in cashflow.index and not cashflow.empty
                else "N/A"
            ),
        }

        # Compile all data
        analysis_result = {
            "company_info": {
                "name": company_name,
                "ceo": ceo_name,
                "market_cap": market_cap,
                "founded": founded_date,
            },
            "annual_ratios": annual_ratios,
            "current_metrics": current_metrics,
        }

        return analysis_result

    except Exception as e:
        app.logger.error(f"Error analyzing stock data: {e}")
        return {"error": f"Failed to analyze stock: {str(e)}"}, 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=1000, debug=True)
