"""
API для управления музыкальной библиотекой, плейлистами и радиостанциями.
Поддерживает добавление треков в библиотеку, создание плейлистов и управление радио.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {}) or {}
    action = query_params.get('action', 'library')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET' and action == 'library':
            cur.execute('SELECT * FROM tracks ORDER BY added_at DESC')
            tracks = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(row) for row in tracks], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'library':
            body = json.loads(event.get('body', '{}'))
            cur.execute(
                '''INSERT INTO tracks (track_id, title, artist, album, duration, audio_url) 
                   VALUES (%s, %s, %s, %s, %s, %s) 
                   ON CONFLICT (track_id) DO NOTHING RETURNING *''',
                (body['id'], body['title'], body['artist'], 
                 body.get('album'), body['duration'], body.get('audioUrl'))
            )
            conn.commit()
            result = cur.fetchone()
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'track': dict(result) if result else None}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'playlists':
            cur.execute('SELECT * FROM playlists ORDER BY created_at DESC')
            playlists = cur.fetchall()
            result = []
            for playlist in playlists:
                cur.execute(
                    'SELECT COUNT(*) as count FROM playlist_tracks WHERE playlist_id = %s',
                    (playlist['id'],)
                )
                count = cur.fetchone()['count']
                result.append({**dict(playlist), 'track_count': count})
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'playlists':
            body = json.loads(event.get('body', '{}'))
            cur.execute(
                'INSERT INTO playlists (name, icon) VALUES (%s, %s) RETURNING *',
                (body['name'], body.get('icon', 'Music'))
            )
            conn.commit()
            result = cur.fetchone()
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'playlist': dict(result)}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'radio':
            cur.execute('SELECT * FROM radio_stations ORDER BY created_at DESC')
            stations = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(row) for row in stations], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'radio':
            body = json.loads(event.get('body', '{}'))
            cur.execute(
                '''INSERT INTO radio_stations (station_id, name, genre, url) 
                   VALUES (%s, %s, %s, %s) 
                   ON CONFLICT (station_id) DO NOTHING RETURNING *''',
                (body['id'], body['name'], body['genre'], body['url'])
            )
            conn.commit()
            result = cur.fetchone()
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'station': dict(result) if result else None}, default=str),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Not found'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()