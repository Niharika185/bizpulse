import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import warnings
warnings.filterwarnings('ignore')


def _analyze_dataframe(df):
    df.columns = df.columns.str.strip()

    rows, cols = df.shape
    columns = list(df.columns)

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    text_cols = df.select_dtypes(include=['object']).columns.tolist()

    summary = {}
    for col in numeric_cols:
        summary[col] = {
            'mean': round(float(df[col].mean()), 2),
            'max': round(float(df[col].max()), 2),
            'min': round(float(df[col].min()), 2),
            'sum': round(float(df[col].sum()), 2),
            'std': round(float(df[col].std()), 2)
        }

    bar_chart = []
    if text_cols and numeric_cols:
        group = df.groupby(text_cols[0])[numeric_cols[0]].sum().reset_index()
        group = group.sort_values(numeric_cols[0], ascending=False).head(10)
        for _, row in group.iterrows():
            bar_chart.append({
                'name': str(row[text_cols[0]]),
                'value': round(float(row[numeric_cols[0]]), 2)
            })

    line_chart = []
    if numeric_cols:
        col = numeric_cols[0]
        for i, val in enumerate(df[col].head(20).tolist()):
            line_chart.append({
                'index': i + 1,
                'value': round(float(val), 2) if not np.isnan(val) else 0
            })

    pie_chart = []
    if text_cols:
        counts = df[text_cols[0]].value_counts().head(6)
        for name, count in counts.items():
            pie_chart.append({
                'name': str(name),
                'value': int(count)
            })

    anomalies = []
    if numeric_cols:
        col = numeric_cols[0]
        mean = df[col].mean()
        std = df[col].std()
        for i, val in enumerate(df[col]):
            if abs(val - mean) > 2 * std:
                anomalies.append({
                    'row': i + 1,
                    'column': col,
                    'value': round(float(val), 2),
                    'type': 'High' if val > mean else 'Low'
                })

    forecast = []
    if numeric_cols and len(df) >= 10:
        try:
            col = numeric_cols[0]
            series = df[col].dropna()
            model = ExponentialSmoothing(series, trend='add').fit()
            future = model.forecast(5)
            for i, val in enumerate(future):
                forecast.append({
                    'period': f'Next {i+1}',
                    'value': round(float(val), 2)
                })
        except:
            pass

    return {
        'summary': summary,
        'meta': {
            'rows': rows,
            'columns': cols,
            'column_names': columns,
            'numeric_columns': numeric_cols,
            'text_columns': text_cols
        },
        'charts': {
            'bar': bar_chart,
            'line': line_chart,
            'pie': pie_chart
        },
        'anomalies': anomalies,
        'forecast': forecast
    }


def analyze_file_obj(file_obj, file_name):
    """Analyze a file from an in-memory file-like object (BytesIO)."""
    if file_name.endswith('.csv'):
        df = pd.read_csv(file_obj)
    else:
        df = pd.read_excel(file_obj)
    return _analyze_dataframe(df)


def analyze_file(file_path, file_name):
    """Analyze a file from a disk path (kept for backward compatibility)."""
    if file_name.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)
    return _analyze_dataframe(df)